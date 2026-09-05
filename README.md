# Vue 3 + Vite

# Vue Smart Tree Select

A customizable RTL-friendly tree select component for Vue 3.

[Live Demo](https://vue-smart-tree-select.vercel.app/) ·

## Installation

```bash
npm install @monashakeri/vue-smart-tree-select

<script>
import SmartTreeSelect from '@monashakeri/vue-smart-tree-select'
import '@monashakeri/vue-smart-tree-select/style.css'

export default {
  components: {
    SmartTreeSelect,
  },

  data() {
    return {
      selected: [],
      options: [
        {
          _id: 'warehouse',
          title: 'کاربران',
          children: [
            {
              _id: 'warehouse-view',
              title: 'مشاهده کاربران',
            },
            {
              _id: 'warehouse-edit',
              title: 'ویرایش کاربران',
            },
          ],
        },
      ],
    }
  },
}
</script>

<template>
  <SmartTreeSelect
    v-model="selected"
    :options="options"

  />
</template>

## Child title display

به‌صورت پیش‌فرض فقط عنوان child نمایش داده می‌شود:

```text
مشاهده کاربران
```

اگر می‌خواهید عنوان گروه هم کنار عنوان child نمایش داده شود، prop زیر را اضافه کنید:

```vue
<SmartTreeSelect
  v-model="selected"
  :options="options"
  child-title-mode="parent-child"
/>
```

خروجی:

```text
کاربران - مشاهده کاربران
```
