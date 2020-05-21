import { get } from "idb-keyval";
import { Note } from "../../types/interfaces";

export async function getMemo(name: string) {
  const memos = (await get("notes") as Note[]);

  return memos.find((memo) => {
    return memo.name === name;
  })
}