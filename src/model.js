import * as ort from "onnxruntime-web";
import { Chess } from "chess.js";
const PIECE_TO_INDEX = {
  p: 0, // pawn
  n: 1, // knight
  b: 2, // bishop
  r: 3, // rook
  q: 4, // queen
};

function getPieceAt(board, sq) {
  const rank = 7 - Math.floor(sq / 8);
  const file = sq % 8;
  return board[rank][file]; // [rank][file]
}

export function halfkpIndices(fen) {
  const game = new Chess(fen);
  const board = game.board(); // 8x8 [rank][file]
  const whiteIndices = [];
  const blackIndices = [];

  for (const turn of ["w", "b"]) {
    // 킹 위치 찾기
    let kingSq = null;
    // find king square

    for (let sq = 0; sq < 64; sq++) {
      const piece = getPieceAt(board, sq);
      if (piece && piece.type === "k" && piece.color === turn) {
        kingSq = sq;
        break;
      }
    }

    if (kingSq === null) continue;

    const indices = [];
    for (let sq = 0; sq < 64; sq++) {
      const piece = getPieceAt(board, sq);
      if (!piece || piece.type === "k") continue;

      const ptIndex = PIECE_TO_INDEX[piece.type];
      if (ptIndex === undefined) continue;

      const colorOffset = piece.color === turn ? 0 : 1;
      const pieceIndex = ptIndex * 2 + colorOffset;
      const relSq = sq ^ (turn === "w" ? 0 : 56);
      //   const relSq = turn === "w" ? sq : sq ^ 56;
      const index = kingSq * 640 + pieceIndex * 64 + relSq;
      indices.push(index);
    }

    if (turn === "w") whiteIndices.push(...indices);
    else blackIndices.push(...indices);
  }

  return { whiteIndices, blackIndices };
}

export async function evaluate(fen) {
  const { whiteIndices, blackIndices } = halfkpIndices(fen);

  // ONNX 모델 로드 http://localhost:5173/chess-client/capybara_model.onnx
  const session = await ort.InferenceSession.create(
    "/chess-client/capybara_model.onnx"
  );

  function toBigInt64(arr) {
    return new BigInt64Array(arr.map(BigInt));
  }

  const white_input = new ort.Tensor("int64", toBigInt64(whiteIndices), [
    whiteIndices.length,
  ]);
  const white_offset = new ort.Tensor("int64", toBigInt64([0]), [1]);

  const black_input = new ort.Tensor("int64", toBigInt64(blackIndices), [
    blackIndices.length,
  ]);
  const black_offset = new ort.Tensor("int64", toBigInt64([0]), [1]);

  //   const white_input = new ort.Tensor("int32", Int32Array.from(whiteIndices), [
  //     whiteIndices.length,
  //   ]);
  //   const white_offset = new ort.Tensor("int32", Int32Array.from([0]), [1]);
  //   const black_input = new ort.Tensor("int32", Int32Array.from(blackIndices), [
  //     blackIndices.length,
  //   ]);
  //   const black_offset = new ort.Tensor("int32", Int32Array.from([0]), [1]);

  const feeds = {
    white_input,
    white_offset,
    black_input,
    black_offset,
  };

  const results = await session.run(feeds);
  const score = results.score.data[0];
  return score;
}
