<template>
  <div style="padding:40px">
    <SmartTreeSelect
        v-model="selected"
        :options="options"
        child-title-mode="parent-child"
    />
  </div>
</template>

<script>
import SmartTreeSelect from './components/SmartTreeSelect.vue'

export default {
  name: 'App',

  components: {
    SmartTreeSelect
  },

  data() {
    return {
      selected: [],

      options: [
        {
          _id: 'warehouse',
          title: 'دسترسی',
          children: [
            {
              _id: 'warehouse-view',
              title: 'ویرایش کاربر',
            },
            {
              _id: 'warehouse-edit',
              title: 'حذف کلربر',
            },
            {
              _id: 'warehouse-delete',
              title: 'ایجاد کاربر',
            },
          ],
        },
        {
          _id: 'users',
          title: 'کاربران',
          children: [
            {
              _id: 'users-view',
              title: 'مشاهده کاربران',
            },
            {
              _id: 'users-create',
              title: 'ایجاد کاربر',
            },
          ],
        },
      ],
    }
  },
}
</script>