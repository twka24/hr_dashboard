import { defineStore } from 'pinia';
import api from '@/services/api';

export const useAttendanceStore = defineStore('attendance', {
  state: () => ({
    records: [],
    loading: false,
  }),
  actions: {
    async fetchRecords(params) {
      this.loading = true;
      try {
        const { data } = await api.get('/attendance', { params });
        this.records = data;
      } finally {
        this.loading = false;
      }
    },
  },
});