<template>
  <div
      ref="root"
      class="smart-tree-select"
      dir="rtl"
      @keydown.esc="closeDropdown"
  >
    <button
        type="button"
        class="select-trigger"
        :class="{ 'is-open': isDropdownOpen }"
        :aria-expanded="String(isDropdownOpen)"
        aria-haspopup="listbox"
        @click="toggleDropdown"
        @keydown.down.prevent="openDropdown"
        @keydown.enter.prevent="toggleDropdown"
    >
      <span class="select-trigger__content">
        <span v-if="selectedCount" class="count-badge">
          {{ selectedCount }}
        </span>

        <span class="select-trigger__label">
          {{ selectedCount ? `${selectedCount} مورد انتخاب شده` : placeholder }}
        </span>
      </span>

      <span class="select-trigger__actions">
        <span
            v-if="selectedCount"
            class="clear-button"
            role="button"
            tabindex="0"
            aria-label="پاک کردن انتخاب‌ها"
            @click.stop="clearAll"
            @keydown.enter.stop.prevent="clearAll"
        >
          ×
        </span>

        <svg
            class="chevron"
            :class="{ 'is-open': isDropdownOpen }"
            viewBox="0 0 20 20"
        >
          <path d="m5 7 5 5 5-5" />
        </svg>
      </span>
    </button>

    <Transition name="tree-dropdown">
      <section v-if="isDropdownOpen" class="dropdown" @click.stop>
        <div class="dropdown__header">
          <div class="search-box">
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <circle cx="8.5" cy="8.5" r="5.5" />
              <path d="m13 13 4 4" />
            </svg>

            <input
                ref="searchInput"
                v-model="searchQuery"
                type="search"
                autocomplete="off"
                :placeholder="searchPlaceholder"
                aria-label="جست‌وجو در گزینه‌ها"
            />

            <button
                v-if="searchQuery"
                type="button"
                class="search-clear"
                aria-label="پاک کردن جست‌وجو"
                @click="searchQuery = ''"
            >
              ×
            </button>
          </div>

          <div class="selection-summary">
            <span>
              {{ selectedCount ? `${selectedCount} انتخاب شده` : 'هنوز موردی انتخاب نشده' }}
            </span>

            <button
                v-if="selectedCount"
                type="button"
                class="text-button"
                @click="clearAll"
            >
              حذف همه
            </button>
          </div>
        </div>

        <div class="tree-list" role="listbox" aria-multiselectable="true">
          <article
              v-for="parent in filteredOptions"
              :key="parent._id"
              class="tree-group"
          >
            <div class="parent-row">
              <label class="check-control">
                <input
                    type="checkbox"
                    :checked="isParentSelected(parent)"
                    :indeterminate="isParentIndeterminate(parent)"
                    :aria-label="`انتخاب همه موارد ${parent.title}`"
                    @change="toggleParent(parent, $event)"
                />

                <span class="check-control__box" aria-hidden="true">
                  <svg viewBox="0 0 16 16">
                    <path d="m3 8 3 3 7-7" />
                  </svg>
                </span>
              </label>

              <button
                  type="button"
                  class="parent-toggle"
                  :aria-expanded="String(isExpanded(parent._id))"
                  @click="toggleDropdownAccordion(parent._id)"
              >
                <span class="parent-toggle__title">
                  {{ parent.title }}
                </span>

                <span class="parent-toggle__count">
                  {{ parent.children.length }}
                </span>

                <svg
                    class="group-chevron"
                    :class="{ 'is-open': isExpanded(parent._id) }"
                    viewBox="0 0 20 20"
                >
                  <path d="m5 7 5 5 5-5" />
                </svg>
              </button>
            </div>

            <Transition name="tree-children">
              <div
                  v-if="isExpanded(parent._id) && parent.children.length"
                  class="children-list"
              >
                <label
                    v-for="child in parent.children"
                    :key="child._id"
                    class="child-row"
                    :class="{ 'is-selected': isChildSelected(child) }"
                >
                  <input
                      type="checkbox"
                      :checked="isChildSelected(child)"
                      @change="toggleChild(child)"
                  />

                  <span class="native-check" />

                  <span>
                    {{ formatChildTitle(parent.title, child.title) }}
                  </span>
                </label>
              </div>
            </Transition>
          </article>

          <div v-if="!filteredOptions.length" class="empty-state">
            <strong>نتیجه‌ای پیدا نشد</strong>
            <span>عبارت جست‌وجو را تغییر دهید.</span>
          </div>
        </div>
      </section>
    </Transition>

    <section v-if="groupedSelectedItems.length" class="selected-groups">
      <div
          v-for="group in groupedSelectedItems"
          :key="group.parentId"
          class="selected-group"
      >
        <div class="selected-group__header">
          <button
              type="button"
              class="selected-group__toggle"
              :aria-expanded="String(expandedGroups[group.parentId])"
              @click="toggleAccordion(group.parentId)"
          >
            <span>{{ group.parentTitle }}</span>

            <span class="parent-toggle__count">
              {{ group.children.length }}
            </span>
          </button>

          <button
              type="button"
              class="remove-group"
              :aria-label="`حذف تمام موارد ${group.parentTitle}`"
              @click="removeGroup(group)"
          >
            حذف همه
          </button>
        </div>

        <div v-show="expandedGroups[group.parentId]" class="chips">
          <span
              v-for="child in group.children"
              :key="child._id"
              class="chip"
          >
            {{ formatChildTitle(group.parentTitle, child.title) }}

            <button
                type="button"
                :aria-label="`حذف ${formatChildTitle(group.parentTitle, child.title)}`"
                @click="removeChild(child)"
            >
              ×
            </button>
          </span>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import '@fontsource/vazirmatn/400.css'
import '@fontsource/vazirmatn/600.css'
import '@fontsource/vazirmatn/700.css'

export default {
  name: 'SmartTreeSelect',

  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },

    options: {
      type: Array,
      default: () => [],
    },

    placeholder: {
      type: String,
      default: 'انتخاب کنید',
    },

    searchPlaceholder: {
      type: String,
      default: 'جست‌وجو در موارد...',
    },

    childTitleMode: {
      type: String,
      default: 'child',
      validator: (value) => ['child', 'parent-child'].includes(value),
    },
  },

  emits: ['update:modelValue', 'change'],

  data() {
    return {
      isDropdownOpen: false,
      searchQuery: '',
      expandedGroups: {},
      expandedDropdownGroups: {},
    }
  },

  computed: {
    selectedCount() {
      return this.modelValue.length
    },

    filteredOptions() {
      const query = this.searchQuery.trim().toLocaleLowerCase('fa')

      if (!query) {
        return this.options
      }

      return this.options
          .map((parent) => {
            const children = parent.children || []

            const parentMatches = parent.title
                .toLocaleLowerCase('fa')
                .includes(query)

            const matchingChildren = children.filter((child) =>
                child.title.toLocaleLowerCase('fa').includes(query)
            )

            if (!parentMatches && !matchingChildren.length) {
              return null
            }

            return {
              ...parent,
              children: parentMatches ? children : matchingChildren,
            }
          })
          .filter(Boolean)
    },

    groupedSelectedItems() {
      const selectedIds = new Set(this.modelValue)

      return this.options
          .map((parent) => {
            const children = (parent.children || []).filter((child) =>
                selectedIds.has(child._id)
            )

            if (!children.length) {
              return null
            }

            return {
              parentId: parent._id,
              parentTitle: parent.title,
              children,
            }
          })
          .filter(Boolean)
    },
  },

  watch: {
    searchQuery(value) {
      if (!value.trim()) {
        return
      }

      this.filteredOptions.forEach((parent) => {
        this.expandedDropdownGroups[parent._id] = true
      })
    },

    groupedSelectedItems: {
      immediate: true,

      handler(groups) {
        groups.forEach((group) => {
          if (this.expandedGroups[group.parentId] === undefined) {
            this.expandedGroups[group.parentId] = true
          }
        })
      },
    },
  },

  mounted() {
    document.addEventListener('pointerdown', this.handleClickOutside)
  },

  beforeUnmount() {
    document.removeEventListener('pointerdown', this.handleClickOutside)
  },

  methods: {
    handleClickOutside(event) {
      if (!this.$refs.root?.contains(event.target)) {
        this.closeDropdown()
      }
    },

    openDropdown() {
      this.isDropdownOpen = true

      this.$nextTick(() => {
        this.$refs.searchInput?.focus()
      })
    },

    closeDropdown() {
      this.isDropdownOpen = false
      this.searchQuery = ''
    },

    toggleDropdown() {
      if (this.isDropdownOpen) {
        this.closeDropdown()
      } else {
        this.openDropdown()
      }
    },

    isExpanded(id) {
      return Boolean(this.expandedDropdownGroups[id])
    },

    toggleDropdownAccordion(id) {
      this.expandedDropdownGroups[id] =
          !this.expandedDropdownGroups[id]
    },

    toggleAccordion(id) {
      this.expandedGroups[id] = !this.expandedGroups[id]
    },

    formatChildTitle(parentTitle, childTitle) {
      if (this.childTitleMode === 'parent-child') {
        return `${parentTitle} - ${childTitle}`
      }

      return childTitle
    },

    isChildSelected(child) {
      return this.modelValue.includes(child._id)
    },

    isParentSelected(parent) {
      return (
          parent.children?.length > 0 &&
          parent.children.every((child) =>
              this.modelValue.includes(child._id)
          )
      )
    },

    isParentIndeterminate(parent) {
      const selectedCount = (parent.children || []).filter((child) =>
          this.modelValue.includes(child._id)
      ).length

      return (
          selectedCount > 0 &&
          selectedCount < parent.children.length
      )
    },

    updateValue(value) {
      this.$emit('update:modelValue', value)
      this.$emit('change', value)
    },

    toggleChild(child) {
      const nextValue = this.isChildSelected(child)
          ? this.modelValue.filter((id) => id !== child._id)
          : [...this.modelValue, child._id]

      this.updateValue(nextValue)
    },

    toggleParent(parent, event) {
      const ids = parent.children.map((child) => child._id)

      const nextValue = event.target.checked
          ? [...new Set([...this.modelValue, ...ids])]
          : this.modelValue.filter((id) => !ids.includes(id))

      this.updateValue(nextValue)
    },

    clearAll() {
      this.updateValue([])
    },

    removeChild(child) {
      this.updateValue(
          this.modelValue.filter((id) => id !== child._id)
      )
    },

    removeGroup(group) {
      const ids = new Set(group.children.map((child) => child._id))

      this.updateValue(
          this.modelValue.filter((id) => !ids.has(id))
      )
    },
  },
}
</script>


<style scoped>
.smart-tree-select {
  --sts-primary: #0f766e;
  --sts-primary-hover: #115e59;
  --sts-primary-light: #ecfdf5;
  --sts-text: #0f172a;
  --sts-muted: #64748b;
  --sts-border: #e2e8f0;
  --sts-surface: #ffffff;
  --sts-subtle: #f8fafc;
  --sts-danger: #dc2626;

  position: relative;
  width: 100%;
  color: var(--sts-text);
  font-family: Vazirmatn, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  box-sizing: border-box;
}

.smart-tree-select *,
.smart-tree-select *::before,
.smart-tree-select *::after {
  box-sizing: border-box;
}

/* Trigger */

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 52px;
  padding: 8px 12px 8px 14px;
  border: 1px solid var(--sts-border);
  border-radius: 14px;
  background: var(--sts-surface);
  color: var(--sts-text);
  cursor: pointer;
  text-align: right;
  transition: border-color 160ms ease, box-shadow 160ms ease;
  font-family: Vazirmatn, sans-serif;

}

.select-trigger:hover {
  border-color: #94a3b8;
}

.select-trigger:focus-visible,
.parent-toggle:focus-visible,
.selected-group__toggle:focus-visible,
button:focus-visible,
input:focus-visible {
  outline: 3px solid rgba(15, 118, 110, 0.18);
  outline-offset: 2px;
}

.select-trigger.is-open {
  border-color: var(--sts-primary);
  box-shadow: 0 0 0 4px rgba(15, 118, 110, 0.1);
}

.select-trigger__content,
.select-trigger__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.select-trigger__label {
  overflow: hidden;
  color: var(--sts-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.count-badge {
  display: grid;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  place-items: center;
  border-radius: 50%;
  background: var(--sts-primary);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.clear-button {
  display: grid;
  width: 26px;
  height: 26px;
  place-items: center;
  border-radius: 8px;
  color: var(--sts-muted);
  font-size: 21px;
  font-weight: 300;
  line-height: 1;
}

.clear-button:hover {
  background: #fee2e2;
  color: var(--sts-danger);
}

.chevron,
.group-chevron {
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
  color: var(--sts-muted);
  transition: transform 180ms ease;
}

.chevron path,
.group-chevron path {
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.chevron.is-open,
.group-chevron.is-open {
  transform: rotate(180deg);
}

/* Dropdown */

.dropdown {
  position: absolute;
  z-index: 20;
  top: calc(100% + 8px);
  right: 0;
  left: 0;
  overflow: hidden;
  border: 1px solid var(--sts-border);
  border-radius: 16px;
  background: var(--sts-surface);
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.16);
}

.dropdown__header {
  padding: 12px;
  border-bottom: 1px solid var(--sts-border);
  background: var(--sts-surface);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 10px;
  border: 1px solid var(--sts-border);
  border-radius: 10px;
  background: var(--sts-subtle);
  transition: border-color 160ms ease, box-shadow 160ms ease;
}

.search-box:focus-within {
  border-color: var(--sts-primary);
  box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.1);
}

.search-box svg {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
  color: #94a3b8;
}

.search-box svg circle,
.search-box svg path {
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 1.8;
}

.search-box input {
  width: 100%;
  height: 42px;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--sts-text);
  font: inherit;
}

.search-box input::placeholder {
  color: #94a3b8;
}

.search-clear {
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--sts-muted);
  cursor: pointer;
  font-size: 19px;
  line-height: 1;
}

.search-clear:hover {
  background: #e2e8f0;
}

.selection-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 2px 0;
  color: var(--sts-muted);
  font-size: 12px;
}

.text-button,
.remove-group {
  border: 0;
  background: transparent;
  color: var(--sts-primary);
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
}

.text-button:hover,
.remove-group:hover {
  color: var(--sts-primary-hover);
  text-decoration: underline;
}

/* Tree */

.tree-list {
  max-height: 330px;
  padding: 8px;
  overflow-y: auto;
}

.tree-list::-webkit-scrollbar {
  width: 6px;
}

.tree-list::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: #cbd5e1;
}

.tree-group {
  overflow: hidden;
  margin-bottom: 4px;
  border-radius: 11px;
}

.parent-row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px;
}

.parent-row:hover {
  background: var(--sts-subtle);
}

.parent-toggle,
.selected-group__toggle {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 8px;
  padding: 9px 8px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--sts-text);
  cursor: pointer;
  font: inherit;
  text-align: right;
}

.parent-toggle__title {
  overflow: hidden;
  flex: 1;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.parent-toggle__count {
  min-width: 24px;
  padding: 2px 7px;
  border-radius: 99px;
  background: #e2e8f0;
  color: var(--sts-muted);
  font-size: 11px;
  font-weight: 700;
  text-align: center;
}

/* Custom parent checkbox */

.check-control {
  display: grid;
  flex: 0 0 38px;
  place-items: center;
  cursor: pointer;
}

.check-control input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.check-control__box {
  display: grid;
  width: 19px;
  height: 19px;
  place-items: center;
  border: 2px solid #cbd5e1;
  border-radius: 6px;
  background: #fff;
  transition: all 150ms ease;
}

.check-control__box svg {
  width: 14px;
  height: 14px;
  opacity: 0;
}

.check-control__box svg path {
  fill: none;
  stroke: #fff;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.3;
}

.check-control input:checked + .check-control__box {
  border-color: var(--sts-primary);
  background: var(--sts-primary);
}

.check-control input:checked + .check-control__box svg {
  opacity: 1;
}

.check-control input:indeterminate + .check-control__box {
  border-color: var(--sts-primary);
  background: var(--sts-primary);
}

.check-control input:indeterminate + .check-control__box::after {
  width: 9px;
  height: 2px;
  border-radius: 10px;
  background: #fff;
  content: "";
}

/* Children */

.children-list {
  margin: 0 22px 7px 8px;
  padding-right: 10px;
  border-right: 1px dashed #cbd5e1;
}

.child-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 38px;
  padding: 7px 10px;
  border-radius: 8px;
  color: var(--sts-muted);
  cursor: pointer;
  transition: background 150ms ease, color 150ms ease;
}

.child-row:hover,
.child-row.is-selected {
  background: var(--sts-primary-light);
  color: var(--sts-primary-hover);
}

.child-row input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.native-check {
  display: grid;
  width: 17px;
  height: 17px;
  flex: 0 0 17px;
  place-items: center;
  border: 1.5px solid #cbd5e1;
  border-radius: 5px;
  background: #fff;
}

.child-row input:checked + .native-check {
  border-color: var(--sts-primary);
  background: var(--sts-primary);
}

.child-row input:checked + .native-check::after {
  color: #fff;
  content: "✓";
  font-size: 12px;
  font-weight: 800;
}

/* Empty and footer */

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 36px 16px;
  color: var(--sts-muted);
  text-align: center;
}

.empty-state strong {
  color: #475569;
}

.empty-state span {
  font-size: 12px;
}

.dropdown__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid var(--sts-border);
  background: var(--sts-subtle);
}

.primary-button,
.secondary-button {
  min-height: 34px;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
}

.primary-button {
  border: 1px solid var(--sts-primary);
  background: var(--sts-primary);
  color: #fff;
}

.primary-button:hover {
  border-color: var(--sts-primary-hover);
  background: var(--sts-primary-hover);
}

.secondary-button {
  border: 1px solid var(--sts-border);
  background: #fff;
  color: #475569;
}

.secondary-button:hover {
  background: #f1f5f9;
}

/* Selected groups */

.selected-groups {
  display: grid;
  gap: 10px;
  margin-top: 12px;
}

.selected-group {
  overflow: hidden;
  border: 1px solid var(--sts-border);
  border-radius: 13px;
  background: #fff;
}

.selected-group__header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 7px;
  background: var(--sts-subtle);
}

.selected-group__toggle {
  padding: 8px;
}

.selected-group__toggle span:first-child {
  flex: 1;
  font-weight: 600;
}

.remove-group {
  padding: 7px;
  color: var(--sts-danger);
  white-space: nowrap;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  padding: 10px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  padding: 5px 7px 5px 5px;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  background: var(--sts-primary-light);
  color: var(--sts-primary-hover);
  font-size: 12px;
}

.chip button {
  display: grid;
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  place-items: center;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 17px;
  line-height: 1;
}

.chip button:hover {
  background: rgba(15, 118, 110, 0.12);
}

/* Transitions */

.tree-dropdown-enter-active,
.tree-dropdown-leave-active {
  transition: opacity 160ms ease, transform 160ms ease;
}

.tree-dropdown-enter,
.tree-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.tree-children-enter-active,
.tree-children-leave-active {
  overflow: hidden;
  transition: opacity 160ms ease, transform 160ms ease;
}

.tree-children-enter,
.tree-children-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

@media (max-width: 480px) {
  .dropdown {
    position: fixed;
    top: auto;
    right: 12px;
    bottom: 12px;
    left: 12px;
    max-height: calc(100dvh - 24px);
  }

  .tree-list {
    max-height: 42dvh;
  }

  .chip {
    width: 100%;
    justify-content: space-between;
  }
}
</style>