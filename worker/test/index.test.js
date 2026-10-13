import assert from "node:assert/strict";
import test from "node:test";

import { dueNotifications, sanitizeEncryptedBackup, sanitizeSchedule } from "../src/index.js";


test("sanitizeSchedule accepts valid courses and assignments", () => {
  const result = sanitizeSchedule([
    { type: "course", day: 1, start: "11:00", name: "Programlama", reminderMinutes: 15 },
    { type: "assignment", id: "a1", name: "Proje", dueAt: "2026-10-13T12:00:00Z" },
    { type: "course", day: 9, start: "99:00", name: "Geçersiz" },
  ]);

  assert.equal(result.length, 2);
  assert.equal(result[0].type, "course");
  assert.equal(result[1].type, "assignment");
  assert.equal(result[1].reminderMinutes, 1440);
});

test("dueNotifications uses Istanbul time", () => {
  const notifications = dueNotifications([
    { type: "course", day: 1, start: "11:00", name: "Programlama", code: "NBP131", reminderMinutes: 15 },
  ], new Date("2026-10-12T07:45:00Z"));

  assert.equal(notifications.length, 1);
  assert.equal(notifications[0].code, "NBP131");
});

test("sanitizeEncryptedBackup rejects malformed payloads", () => {
  const valid = { version: 1, iv: "A".repeat(16), ciphertext: "B".repeat(24) };
  assert.deepEqual(sanitizeEncryptedBackup(valid), valid);
  assert.equal(sanitizeEncryptedBackup({ ...valid, version: 2 }), null);
  assert.equal(sanitizeEncryptedBackup({ ...valid, iv: "short" }), null);
  assert.equal(sanitizeEncryptedBackup({ ...valid, ciphertext: "not+base64url" }), null);
});
