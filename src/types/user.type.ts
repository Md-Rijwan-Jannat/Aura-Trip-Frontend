export interface TPersistUser {
  id: string;
  email: string;
  role: string;
}

export interface TUser {
  name: string;
  email: string;
  bio: string;
  image?: string;
  coverImage?: string | null;
  password: string;
  role: string;
  status: string;
  follower: string[];
  following: string[];
  verified: boolean;
  country: any;
  address: any;
  isDeleted: boolean;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
