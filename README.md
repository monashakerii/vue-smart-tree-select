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
    child-title-mode="parent-child"
  />
</template>
