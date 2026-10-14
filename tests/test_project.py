import json
import re
import sqlite3
import unittest
from datetime import date
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]


class DocumentParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.references = []

    def handle_starttag(self, _tag, attrs):
        attributes = dict(attrs)
        if attributes.get("id"):
            self.ids.append(attributes["id"])
        for name in ("src", "href"):
            if attributes.get(name):
                self.references.append(attributes[name])


class ProjectTests(unittest.TestCase):
    def test_html_ids_are_unique_and_local_assets_exist(self):
        parser = DocumentParser()
        parser.feed((ROOT / "index.html").read_text(encoding="utf-8"))

        self.assertEqual(len(parser.ids), len(set(parser.ids)), "index.html contains duplicate IDs")
        for reference in parser.references:
            parsed = urlparse(reference)
            if parsed.scheme or reference.startswith(("#", "//", "data:", "mailto:", "tel:")):
                continue
            self.assertTrue((ROOT / parsed.path.lstrip("/")).exists(), f"Missing local asset: {reference}")

    def test_cloud_backup_controls_are_wired(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        javascript = (ROOT / "app.js").read_text(encoding="utf-8")
        control_ids = {
            "cloudBackupCode",
            "cloudBackupStatus",
            "saveCloudBackupButton",
            "copyCloudBackupCodeButton",
            "cloudAutoSyncEnabled",
            "disconnectCloudBackupButton",
            "deleteCloudBackupButton",
        }
        for control_id in control_ids:
            self.assertIn(f'id="{control_id}"', html)
            self.assertIn(f'#{control_id}', javascript)

    def test_mobile_sync_field_cannot_expand_settings(self):
        styles = (ROOT / "styles.css").read_text(encoding="utf-8")
        self.assertRegex(styles, r"\.settings-dialog\s*\{[^}]*overflow-x:\s*hidden")
        self.assertRegex(styles, r"\.settings-content\s*\{[^}]*overflow-x:\s*hidden")
        self.assertRegex(styles, r"\.cloud-backup-card\s*\{[^}]*min-width:\s*0")
        self.assertRegex(styles, r"\.cloud-backup-code input\s*\{[^}]*min-width:\s*0")
        self.assertRegex(styles, r"\.setting-select select\s*\{[^}]*min-width:\s*0")

    def test_mobile_install_card_is_compact(self):
        javascript = (ROOT / "app.js").read_text(encoding="utf-8")
        styles = (ROOT / "styles.css").read_text(encoding="utf-8")
        self.assertIn('textContent = "Ana ekrana ekle"', javascript)
        self.assertIn(".settings-tool-grid .install-card p { display: none; }", styles)
        self.assertRegex(styles, r"\.settings-tool-grid \.install-card > button\s*\{[^}]*white-space:\s*nowrap")

    def test_cloud_sync_is_live_and_automatic(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        javascript = (ROOT / "app.js").read_text(encoding="utf-8")
        self.assertNotIn('id="restoreCloudBackupButton"', html)
        self.assertNotIn('id="checkCloudBackupButton"', html)
        self.assertIn("setInterval(() => syncCloudNow", javascript)
        self.assertIn("applyAppBackupLive(remoteBackup)", javascript)
        self.assertIn("mergeAppBackups(backupToUpload, remoteBackup)", javascript)

    def test_offline_queue_and_status_are_wired(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        javascript = (ROOT / "app.js").read_text(encoding="utf-8")
        self.assertIn('id="syncStatusButton"', html)
        self.assertIn('id="syncStatusLabel"', html)
        self.assertIn("OFFLINE_QUEUE_KEY", javascript)
        self.assertIn("enqueueOfflineOperation", javascript)
        self.assertIn("clearOfflineQueue", javascript)
        self.assertIn('window.addEventListener("offline", renderSyncStatus)', javascript)

    def test_home_personalization_is_wired(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        javascript = (ROOT / "app.js").read_text(encoding="utf-8")
        for control_id in (
            "homeAcademicSummary",
            "homeIntroVisible",
            "homeSummaryVisible",
            "homeMenuVisible",
            "homeSectionOrder",
        ):
            self.assertIn(f'id="{control_id}"', html)
            self.assertIn(f'#{control_id}', javascript)
        self.assertIn("HOME_PREFERENCES_KEY", javascript)
        self.assertIn("renderHomeSummary", javascript)

    def test_pwa_update_prompt_is_wired(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        javascript = (ROOT / "app.js").read_text(encoding="utf-8")
        service_worker = (ROOT / "service-worker.js").read_text(encoding="utf-8")
        for control_id in ("updateBanner", "applyUpdateButton", "dismissUpdateButton"):
            self.assertIn(f'id="{control_id}"', html)
            self.assertIn(f'#{control_id}', javascript)
        self.assertIn('type: "SKIP_WAITING"', javascript)
        self.assertIn('event.data?.type === "SKIP_WAITING"', service_worker)
        self.assertNotIn('.then(() => self.skipWaiting())', service_worker)

    def test_accessibility_preferences_are_wired(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        javascript = (ROOT / "app.js").read_text(encoding="utf-8")
        theme_init = (ROOT / "theme-init.js").read_text(encoding="utf-8")
        styles = (ROOT / "styles.css").read_text(encoding="utf-8")
        for control_id in ("textSizePreference", "highContrastEnabled", "reducedMotionEnabled"):
            self.assertIn(f'id="{control_id}"', html)
            self.assertIn(f'#{control_id}', javascript)
        self.assertIn("prefers-reduced-motion: reduce", theme_init)
        self.assertIn('data-high-contrast="true"', styles)
        self.assertIn('data-reduced-motion="true"', styles)

    def test_android_rendering_uses_lightweight_effects(self):
        javascript = (ROOT / "app.js").read_text(encoding="utf-8")
        theme_init = (ROOT / "theme-init.js").read_text(encoding="utf-8")
        styles = (ROOT / "styles.css").read_text(encoding="utf-8")
        self.assertIn("/Android/i.test(navigator.userAgent)", theme_init)
        self.assertIn('data-platform="android"', styles)
        self.assertIn("backdrop-filter: none", styles)
        self.assertIn("useReducedInterfaceMotion", javascript)

    def test_color_palettes_are_available_everywhere(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        javascript = (ROOT / "app.js").read_text(encoding="utf-8")
        theme_init = (ROOT / "theme-init.js").read_text(encoding="utf-8")
        styles = (ROOT / "styles.css").read_text(encoding="utf-8")
        for palette in ("classic", "forest", "berry", "sunset", "violet", "ocean"):
            self.assertIn(f'data-palette="{palette}"', html)
            self.assertIn(f'"{palette}"', javascript)
            self.assertIn(f'"{palette}"', theme_init)
            self.assertIn(f'data-palette="{palette}"', styles)

    def test_onboarding_starts_without_a_selected_answer(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        javascript = (ROOT / "app.js").read_text(encoding="utf-8")
        self.assertIn('id="englishPreferenceTitle" tabindex="-1"', html)
        self.assertIn('document.querySelector("#englishPreferenceTitle").focus', javascript)
        for control_id in ("onboardingDepartmentSelect", "onboardingEnglishExempt", "saveProgramPreferenceButton", "departmentSelect"):
            self.assertIn(f'id="{control_id}"', html)
            self.assertIn(f'#{control_id}', javascript)

    def test_settings_starts_without_focusing_close_button(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        javascript = (ROOT / "app.js").read_text(encoding="utf-8")
        self.assertIn('id="settingsDialogTitle" tabindex="-1"', html)
        self.assertIn('document.querySelector("#settingsDialogTitle").focus', javascript)

    def test_schedule_data(self):
        schedule = json.loads((ROOT / "schedule.json").read_text(encoding="utf-8"))
        self.assertEqual(schedule["timezone"], "Europe/Istanbul")
        self.assertEqual(len(schedule["departments"]), 4)
        self.assertIn(schedule["defaultDepartment"], {department["id"] for department in schedule["departments"]})
        time_pattern = re.compile(r"^(?:[01]\d|2[0-3]):[0-5]\d$")
        for department in schedule["departments"]:
            self.assertTrue(department["id"])
            self.assertTrue(department["name"])
            self.assertTrue(department["courses"])
            for course in department["courses"]:
                self.assertIn(course["day"], range(7))
                self.assertRegex(course["start"], time_pattern)
                self.assertRegex(course["end"], time_pattern)
                self.assertLess(course["start"], course["end"])
                for field in ("name", "room", "instructor"):
                    self.assertTrue(str(course[field]).strip(), f"Empty course field: {field}")

    def test_menu_data(self):
        menu = json.loads((ROOT / "menu.json").read_text(encoding="utf-8"))
        dates = []
        for day in menu["days"]:
            date.fromisoformat(day["date"])
            dates.append(day["date"])
            for meal_name in ("lunch", "dinner"):
                meal = day.get(meal_name)
                if meal is not None:
                    self.assertIsInstance(meal["items"], list)
                    self.assertTrue(all(str(item).strip() for item in meal["items"]))
        self.assertEqual(dates, sorted(set(dates)), "Menu dates must be unique and sorted")

    def test_service_worker_assets_exist(self):
        source = (ROOT / "service-worker.js").read_text(encoding="utf-8")
        assets_block = re.search(r"const ASSETS = \[(.*?)\];", source, re.DOTALL)
        self.assertIsNotNone(assets_block)
        assets = re.findall(r'"(\./[^"?]+)"', assets_block.group(1))
        self.assertTrue(assets)
        for asset in assets:
            if asset == "./":
                continue
            self.assertTrue((ROOT / asset.removeprefix("./")).is_file(), f"Missing cached asset: {asset}")

    def test_worker_schema_can_be_applied(self):
        schema = (ROOT / "worker" / "schema.sql").read_text(encoding="utf-8")
        database = sqlite3.connect(":memory:")
        self.addCleanup(database.close)
        database.executescript(schema)
        tables = {row[0] for row in database.execute("SELECT name FROM sqlite_master WHERE type = 'table'")}
        self.assertTrue({"subscriptions", "notification_log", "cloud_backups"}.issubset(tables))


if __name__ == "__main__":
    unittest.main()
