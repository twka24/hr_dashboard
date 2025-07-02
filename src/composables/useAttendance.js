import { computed } from 'vue';
import { useAttendanceStore } from '@/store/attendance';

export function useAttendance() {
  const store = useAttendanceStore();

  const lateCount = computed(() => store.records.filter(r => r.status === 'Late').length);
  const presentToday = computed(() => store.records.filter(r => r.date === new Date().toISOString().slice(0,10)).length);

  return { ...store, lateCount, presentToday };
}