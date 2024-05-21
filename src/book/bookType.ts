import { IUser } from "../user/userTypes";

export interface IBook {
  _id: string;
  title: string;
  author: IUser;
  genre: string;
  coverImage: string;
  file: string;
  createdAt: string;
  updatedAt: string;
}
