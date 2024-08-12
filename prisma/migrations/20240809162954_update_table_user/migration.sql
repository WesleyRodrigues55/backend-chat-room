-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_chat_rooms" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chat_rooms_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "chat_rooms_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_chat_rooms" ("created_at", "id", "message", "room_id", "user_id") SELECT "created_at", "id", "message", "room_id", "user_id" FROM "chat_rooms";
DROP TABLE "chat_rooms";
ALTER TABLE "new_chat_rooms" RENAME TO "chat_rooms";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
