Product CRUD TODOs

- **UI: Prevent duplicate variant sizes**: Validate on client-side in `ProductForm.tsx` to disallow the same `size` for multiple variants.
- **Server: Validate categoryId is child**: In `upsertProduct` (server action), reject requests where `categoryId` references a parent category instead of a leaf/child.
- **Create/Edit: Ensure category select uses child IDs**: (Optional) Improve admin UI to clearly show hierarchy or only allow selecting leaf categories.
- **Delete flow**: Add confirm dialog and decide between soft vs hard delete; implement accordingly.
- **DB Cleanup/Migration**: Script to find products with `categoryId` pointing to parent categories and report or migrate them to correct child IDs.
- **Tests/Fixtures**: Add a few test fixtures for product create/update/delete covering category and variant rules.
- **Logging/Monitoring**: Add server-side logs for failed validations (category/variants) to help debugging.

Next steps:
1. Pick one item to implement (recommend: server validation for `categoryId`).
2. Implement, run tests, and review.

Notes:
- We reverted temporary UI changes; proceed carefully to not reintroduce them until validated.
- We'll review and implement these items together tomorrow.