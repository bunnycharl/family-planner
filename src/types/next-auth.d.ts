import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      avatarColor: string;
      familyId: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    avatarColor: string;
    familyId: string;
  }
}
