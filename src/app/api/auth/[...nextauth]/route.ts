import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import KakaoProvider from "next-auth/providers/kakao"
import NaverProvider from "next-auth/providers/naver"
import EmailProvider from "next-auth/providers/email"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    // 이메일/비밀번호 로그인
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "이메일", type: "email", placeholder: "email@example.com" },
        password: { label: "비밀번호", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("이메일과 비밀번호를 입력해주세요")
        }

        const user = await prisma.users.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          throw new Error("등록되지 않은 이메일입니다")
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error("비밀번호가 일치하지 않습니다")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.avatar
        }
      }
    }),

    // 카카오 로그인
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),

    // 네이버 로그인
    NaverProvider({
      clientId: process.env.NAVER_CLIENT_ID!,
      clientSecret: process.env.NAVER_CLIENT_SECRET!,
    }),

    // 이메일 매직 링크 로그인
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD
        }
      },
      from: process.env.EMAIL_FROM,
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7일
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      // 소셜 로그인 시 사용자 정보 저장/업데이트
      if (account?.provider === "kakao" || account?.provider === "naver") {
        const email = user.email || `${account.provider}_${account.providerAccountId}@social.com`

        const existingUser = await prisma.users.findUnique({
          where: { email }
        })

        if (!existingUser) {
          // 새 사용자 생성
          await prisma.users.create({
            data: {
              id: `social_${Date.now()}`,
              email,
              name: user.name || "사용자",
              password: await bcrypt.hash(Math.random().toString(36), 10), // 랜덤 비밀번호
              role: "PATIENT",
              avatar: user.image,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          })
        } else {
          // 기존 사용자 정보 업데이트
          await prisma.users.update({
            where: { email },
            data: {
              name: user.name || existingUser.name,
              avatar: user.image || existingUser.avatar,
              updatedAt: new Date()
            }
          })
        }
      }
      return true
    },

    async jwt({ token, user, account }) {
      if (user) {
        const dbUser = await prisma.users.findUnique({
          where: { email: user.email! }
        })

        token.id = dbUser?.id
        token.role = dbUser?.role
        token.name = dbUser?.name
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.name = token.name as string
      }
      return session
    }
  },

  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/welcome"
  },

  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }