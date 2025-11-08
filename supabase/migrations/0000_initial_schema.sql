CREATE TABLE "User" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "email" varchar(64) NOT NULL,
  "password" varchar(64)
);

CREATE TABLE "Chat" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "createdAt" timestamp NOT NULL,
  "title" text NOT NULL,
  "userId" uuid NOT NULL REFERENCES "User"("id"),
  "visibility" varchar(255) NOT NULL DEFAULT 'private',
  "lastContext" jsonb
);

CREATE TABLE "Message_v2" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "chatId" uuid NOT NULL REFERENCES "Chat"("id"),
  "role" varchar NOT NULL,
  "parts" json NOT NULL,
  "attachments" json NOT NULL,
  "createdAt" timestamp NOT NULL
);

CREATE TABLE "Vote_v2" (
  "chatId" uuid NOT NULL REFERENCES "Chat"("id"),
  "messageId" uuid NOT NULL REFERENCES "Message_v2"("id"),
  "isUpvoted" boolean NOT NULL,
  PRIMARY KEY ("chatId", "messageId")
);
