import assert from "node:assert/strict";
import test from "node:test";

import { capitalizePersonName } from "@/lib/formatting/capitalize";
import {
  calculateCommissionAmounts,
  formatPercentFromBps,
  percentToBps,
} from "@/lib/formatting/commission";
import { formatEnumLabel } from "@/lib/formatting/enum-label";
import { getOptionLabel } from "@/lib/formatting/option-label";
import { getPermissionsForRole } from "@/lib/permissions/visibility";
import { DASHBOARD_CARD_PERMISSIONS } from "@/lib/permissions/route-permissions";
import { isPreviewRole, PREVIEW_ROLES } from "@/lib/permissions/roles";

test("getOptionLabel resolves stored IDs to readable labels", () => {
  const options = [
    { label: "Tim Brady", value: "user_01KXYZ123456" },
    { label: "Tater Benson", value: "user_02ABC987654" },
  ];

  assert.equal(getOptionLabel("user_01KXYZ123456", options), "Tim Brady");
  assert.equal(getOptionLabel("missing", options), undefined);
});

test("formatEnumLabel converts machine values to readable labels", () => {
  assert.equal(formatEnumLabel("buyer_representation"), "Buyer Representation");
  assert.equal(formatEnumLabel("under_contract"), "Under Contract");
  assert.equal(formatEnumLabel("title_company"), "Title Company");
});

test("capitalizePersonName preserves special capitalization patterns", () => {
  assert.equal(capitalizePersonName("tim brady"), "Tim Brady");
  assert.equal(capitalizePersonName("mcdonald"), "McDonald");
  assert.equal(capitalizePersonName("o'connor"), "O'Connor");
});

test("commission calculations use decimal-safe integer math", () => {
  const result = calculateCommissionAmounts({
    salePriceDollars: 300_000,
    commissionPercentageBps: percentToBps(3),
    brokerageSplitBps: percentToBps(30),
  });

  assert.equal(result.grossCommissionDollars, 9_000);
  assert.equal(result.brokerageFeeDollars, 2_700);
  assert.equal(result.agentNetCommissionDollars, 6_300);
  assert.equal(formatPercentFromBps(250), "2.5%");
});

test("preview roles and accountant visibility hide buyer-facing modules", () => {
  assert.equal(isPreviewRole("accountant"), true);
  assert.equal(isPreviewRole("admin"), false);
  assert.equal(PREVIEW_ROLES.length, 5);

  const accountantPermissions = getPermissionsForRole("accountant");
  assert.equal(accountantPermissions.has("view_commissions"), true);
  assert.equal(accountantPermissions.has("view_buyers"), false);
  assert.equal(accountantPermissions.has("view_showings"), false);
  assert.equal(DASHBOARD_CARD_PERMISSIONS["buyer-leads"], "view_buyers");
});
