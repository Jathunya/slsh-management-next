export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const { pathname } = request.nextUrl;

      if (pathname === "/login") {
        return true;
      }
      if (
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/parcels") ||
        pathname.startsWith("/assets") ||
        pathname.startsWith("/residents") ||
        pathname.startsWith("/utilities") ||
        pathname.startsWith("/messages")
      ) {
        return isLoggedIn && role === "ADMIN";
      }
      if (
        pathname.startsWith("/my-parcels") ||
        pathname.startsWith("/profile") ||
        pathname.startsWith("/bills")
      ) {
        return isLoggedIn;
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.unitId = user.unitId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.unitId = token.unitId;
      }
      return session;
    },
  },
  providers: [],
};
