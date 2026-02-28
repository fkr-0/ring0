VERSION_FILE := VERSION

.PHONY: init-version version bump-patch bump-minor bump-major

init-version:
	@test -f $(VERSION_FILE) || echo "0.1.0" > $(VERSION_FILE)

version: init-version
	@cat $(VERSION_FILE)

bump-patch: init-version
	@awk -F. '{printf "%d.%d.%d\n", $$1, $$2, $$3 + 1}' $(VERSION_FILE) > $(VERSION_FILE).tmp
	@mv $(VERSION_FILE).tmp $(VERSION_FILE)
	@echo "Bumped patch to $$(cat $(VERSION_FILE))"

bump-minor: init-version
	@awk -F. '{printf "%d.%d.0\n", $$1, $$2 + 1}' $(VERSION_FILE) > $(VERSION_FILE).tmp
	@mv $(VERSION_FILE).tmp $(VERSION_FILE)
	@echo "Bumped minor to $$(cat $(VERSION_FILE))"

bump-major: init-version
	@awk -F. '{printf "%d.0.0\n", $$1 + 1}' $(VERSION_FILE) > $(VERSION_FILE).tmp
	@mv $(VERSION_FILE).tmp $(VERSION_FILE)
	@echo "Bumped major to $$(cat $(VERSION_FILE))"
