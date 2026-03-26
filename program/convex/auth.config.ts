import { defineAuthConfig } from "@convex-dev/auth/server";

export default defineAuthConfig({
  providers: [
    // OAuth Providers - credentials will be loaded from environment variables
    {
      id: "google",
      type: "oauth",
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        url: "https://accounts.google.com/o/oauth2/v2/auth",
        params: {
          scope: "openid email profile",
          access_type: "offline",
          prompt: "consent",
        },
      },
      token: {
        url: "https://oauth2.googleapis.com/token",
      },
      userinfo: {
        url: "https://openidconnect.googleapis.com/v1/userinfo",
      },
      profile: (profile: any) => ({
        id: profile.sub,
        email: profile.email,
        name: profile.name,
        image: profile.picture,
      }),
    },
    {
      id: "github",
      type: "oauth",
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        url: "https://github.com/login/oauth/authorize",
        params: {
          scope: "read:user user:email",
        },
      },
      token: {
        url: "https://github.com/login/oauth/access_token",
      },
      userinfo: {
        url: "https://api.github.com/user",
      },
      profile: (profile: any) => ({
        id: profile.id.toString(),
        email: profile.email,
        name: profile.name || profile.login,
        image: profile.avatar_url,
      }),
    },
  ],
  
  // Email configuration for password reset and verification
  email: {
    provider: "resend",
    apiKey: process.env.RESEND_API_KEY!,
    from: process.env.EMAIL_FROM || "noreply@pharmacare.app",
  },
  
  // Session configuration
  session: {
    // Session duration in seconds (30 days)
    maxAge: 30 * 24 * 60 * 60,
    // Update session age on each request
    updateAge: 24 * 60 * 60,
  },
  
  // Custom pages
  pages: {
    signIn: "/auth/login",
    signUp: "/auth/signup",
    error: "/auth/error",
    verifyRequest: "/auth/verify-email",
    newUser: "/auth/pending-approval",
  },
  
  // Callbacks
  callbacks: {
    // Called when a user signs in
    async signIn({ user, account, profile }) {
      // Allow all sign-ins, we'll handle approval in the app
      return true;
    },
    
    // Called when creating a session
    async session({ session, user }) {
      // Add custom claims to session
      if (session.user) {
        // These will be populated from the database
        session.user.role = user.role || "pending";
        session.user.pharmacyId = user.pharmacyId;
        session.user.branchId = user.branchId;
      }
      return session;
    },
    
    // Called when creating/updating a user
    async createUser({ user, account, profile }) {
      // User will be created in the database via our mutations
      return;
    },
  },
});