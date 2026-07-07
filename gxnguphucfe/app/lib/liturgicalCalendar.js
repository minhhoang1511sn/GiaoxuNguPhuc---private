/**
 * Tính Mùa & Tuần Phụng vụ Công giáo cho 1 ngày bất kỳ — thuật toán chuẩn
 * (Computus tính lễ Phục Sinh + quy tắc Tổng luật Năm Phụng vụ), đối chiếu
 * khớp với dữ liệu công bố của Hội Đồng Giám Mục Việt Nam (hdgmvietnam.com).
 *
 * Đây là phần "tính được" một cách chắc chắn (Mùa, Tuần, các lễ trọng cố định
 * quan trọng nhất). Các lễ nhớ/lễ kính riêng từng vị thánh theo từng ngày rất
 * nhiều và có thể thay đổi theo từng giáo phận nên KHÔNG đưa vào đây để tránh
 * sai sót — trang vẫn có link trực tiếp tới HĐGM Việt Nam / gcatholic.org để
 * xem đầy đủ, chính xác 100% theo ngày.
 */

const DAY_MS = 86400000;

function utc(y, m, d) {
  return new Date(Date.UTC(y, m, d));
}
function addDays(d, n) {
  return new Date(d.getTime() + n * DAY_MS);
}
function mostRecentSunday(d) {
  return addDays(d, -d.getUTCDay());
}
function diffWeeks(a, b) {
  return Math.round((a.getTime() - b.getTime()) / (7 * DAY_MS));
}
function sameDate(a, b) {
  return a.getTime() === b.getTime();
}

// Chủ nhật Phục sinh (thuật toán Meeus/Jones/Butcher — chuẩn lịch Gregorian)
function computeEaster(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return utc(year, month - 1, day);
}

// Lễ Hiển Linh: Chúa Nhật trong khoảng 2-8/1 (theo lịch Việt Nam/Hoa Kỳ)
function computeEpiphany(year) {
  for (let day = 2; day <= 8; day++) {
    const d = utc(year, 0, day);
    if (d.getUTCDay() === 0) return d;
  }
  return utc(year, 0, 6);
}

// Lễ Chúa Giêsu chịu Phép Rửa: CN sau Hiển Linh, trừ khi Hiển Linh rơi vào 7-8/1
// thì Phép Rửa dời sang thứ Hai ngay sau đó.
function computeBaptismOfLord(year) {
  const epi = computeEpiphany(year);
  if (epi.getUTCDate() >= 7) return addDays(epi, 1);
  return addDays(epi, 7);
}

// CN thứ I Mùa Vọng: Chúa Nhật gần 30/11 nhất (trong khoảng 27/11 - 3/12)
function computeFirstAdventSunday(year) {
  for (let day = 27; day <= 30; day++) {
    const d = utc(year, 10, day);
    if (d.getUTCDay() === 0) return d;
  }
  for (let day = 1; day <= 3; day++) {
    const d = utc(year, 11, day);
    if (d.getUTCDay() === 0) return d;
  }
  return utc(year, 10, 30);
}

const ROMAN = [
  'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV',
  'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI',
  'XXVII', 'XXVIII', 'XXIX', 'XXX', 'XXXI', 'XXXII', 'XXXIII', 'XXXIV',
];

// Màu phụng vụ theo mùa — dùng để tô chấm màu nhỏ trên mỗi ô ngày
export const SEASON_COLOR = {
  advent: '#7c3aed',    // Tím
  christmas: '#d4a017', // Trắng/Vàng (kim)
  lent: '#7c3aed',      // Tím
  triduum: '#dc2626',   // Đỏ (Thứ Sáu/Thứ Bảy Tuần Thánh mang sắc thái riêng)
  easter: '#d4a017',    // Trắng/Vàng
  ordinary: '#16a34a',  // Xanh lá
  solemnity: '#d4a017', // Trắng/Vàng (lễ trọng riêng lẻ)
  martyr: '#dc2626',    // Đỏ (lễ các thánh tử đạo)
};

// Một số lễ trọng/lễ kính cố định theo ngày dương lịch, được biết chắc chắn
// và áp dụng chung cho toàn Giáo hội — không đầy đủ 365 ngày (xem ghi chú đầu file).
// solemnity=true: luôn được ưu tiên hơn cả Chúa Nhật Thường Niên.
const FIXED_FEASTS = {
  '01-01': { label: 'Đức Maria, Mẹ Thiên Chúa', season: 'christmas', solemnity: true },
  '02-02': { label: 'Dâng Chúa Giêsu vào Đền Thánh', season: 'solemnity' },
  '03-19': { label: 'Thánh Giuse, Bạn Trăm Năm Đức Maria', season: 'solemnity', solemnity: true },
  '03-25': { label: 'Truyền Tin', season: 'solemnity', solemnity: true },
  '06-24': { label: 'Sinh Nhật Thánh Gioan Tẩy Giả', season: 'solemnity', solemnity: true },
  '06-29': { label: 'Thánh Phêrô và Thánh Phaolô Tông Đồ', season: 'solemnity', solemnity: true },
  '08-06': { label: 'Chúa Hiển Dung', season: 'solemnity' },
  '08-15': { label: 'Đức Mẹ Lên Trời', season: 'solemnity', solemnity: true },
  '09-08': { label: 'Sinh Nhật Đức Trinh Nữ Maria', season: 'solemnity' },
  '09-14': { label: 'Suy Tôn Thánh Giá', season: 'solemnity' },
  '11-01': { label: 'Lễ Các Thánh Nam Nữ', season: 'solemnity', solemnity: true },
  '11-02': { label: 'Lễ Các Đẳng Linh Hồn', season: 'solemnity' },
  '12-08': { label: 'Đức Mẹ Vô Nhiễm Nguyên Tội', season: 'solemnity', solemnity: true },
};

/**
 * Trả về { label, season } cho 1 ngày. year/month(1-12)/day theo lịch dương.
 */
export function getLiturgicalInfo(year, month, day) {
  const date = utc(year, month - 1, day);
  const isSunday = date.getUTCDay() === 0;
  const mmdd = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const easter = computeEaster(year);
  const ash = addDays(easter, -46);
  const pentecost = addDays(easter, 49);
  const adventStart = computeFirstAdventSunday(year);
  const christKing = addDays(adventStart, -7);
  const epiphany = computeEpiphany(year);
  const baptism = computeBaptismOfLord(year);
  const christmasDay = utc(year, 11, 25);

  const fixed = FIXED_FEASTS[mmdd];
  const applyFixedIfWeekday = () => (fixed && !isSunday ? fixed : null);

  // Mùa Vọng
  if (date.getTime() >= adventStart.getTime() && date.getTime() < christmasDay.getTime()) {
    const overridden = fixed?.solemnity ? fixed : applyFixedIfWeekday();
    if (overridden) return { label: overridden.label, season: overridden.season };
    const sun = mostRecentSunday(date);
    const w = diffWeeks(sun, adventStart) + 1;
    return isSunday
      ? { label: `Chúa Nhật ${ROMAN[w - 1]} Mùa Vọng`, season: 'advent' }
      : { label: `Tuần ${w} Mùa Vọng`, season: 'advent' };
  }

  // Mùa Giáng Sinh (25/12 - 31/12)
  if (date.getTime() >= christmasDay.getTime() && month === 12) {
    if (day === 25) return { label: 'Lễ Chúa Giáng Sinh', season: 'christmas' };
    if (isSunday) return { label: 'Lễ Thánh Gia Thất', season: 'christmas' };
    if (day === 26) return { label: 'Thánh Stêphanô Tử Đạo Tiên Khởi', season: 'martyr' };
    if (day === 27) return { label: 'Thánh Gioan Tông Đồ', season: 'christmas' };
    if (day === 28) return { label: 'Các Thánh Anh Hài Tử Đạo', season: 'martyr' };
    if (day === 31) return { label: 'Ngày VII Bát Nhật Giáng Sinh', season: 'christmas' };
    return { label: 'Tuần Bát Nhật Giáng Sinh', season: 'christmas' };
  }

  // Tháng 1: trước/đúng Hiển Linh
  if (month === 1 && date.getTime() <= epiphany.getTime()) {
    if (sameDate(date, epiphany)) return { label: 'Lễ Hiển Linh', season: 'christmas' };
    if (day === 1) return { label: 'Đức Maria, Mẹ Thiên Chúa', season: 'christmas' };
    return { label: 'Mùa Giáng Sinh', season: 'christmas' };
  }
  if (date.getTime() > epiphany.getTime() && date.getTime() <= baptism.getTime()) {
    if (sameDate(date, baptism)) return { label: 'Lễ Chúa Giêsu chịu Phép Rửa', season: 'christmas' };
    return { label: 'Mùa Giáng Sinh (sau Hiển Linh)', season: 'christmas' };
  }

  // Mùa Chay
  if (date.getTime() >= ash.getTime() && date.getTime() < easter.getTime()) {
    if (sameDate(date, ash)) return { label: 'Thứ Tư Lễ Tro', season: 'lent' };
    const palmSunday = addDays(easter, -7);
    if (date.getTime() >= palmSunday.getTime()) {
      if (sameDate(date, palmSunday)) return { label: 'Chúa Nhật Lễ Lá', season: 'triduum' };
      if (sameDate(date, addDays(easter, -3))) return { label: 'Thứ Năm Tuần Thánh', season: 'triduum' };
      if (sameDate(date, addDays(easter, -2))) return { label: 'Thứ Sáu Tuần Thánh', season: 'triduum' };
      if (sameDate(date, addDays(easter, -1))) return { label: 'Thứ Bảy Tuần Thánh (Vọng Phục Sinh)', season: 'triduum' };
      return { label: 'Tuần Thánh', season: 'triduum' };
    }
    const overridden = applyFixedIfWeekday();
    if (overridden) return { label: overridden.label, season: overridden.season };
    const sun = mostRecentSunday(date);
    const w = diffWeeks(sun, ash) + 1;
    return isSunday
      ? { label: `Chúa Nhật ${ROMAN[w - 1]} Mùa Chay`, season: 'lent' }
      : { label: `Tuần ${w} Mùa Chay`, season: 'lent' };
  }

  // Mùa Phục Sinh
  if (date.getTime() >= easter.getTime() && date.getTime() <= pentecost.getTime()) {
    if (sameDate(date, easter)) return { label: 'Chúa Nhật Phục Sinh', season: 'easter' };
    if (sameDate(date, pentecost)) return { label: 'Chúa Nhật Hiện Xuống (Lễ Ngũ Tuần)', season: 'easter' };
    const ascension = addDays(easter, 42); // VN: mừng vào Chúa Nhật
    if (sameDate(date, ascension)) return { label: 'Chúa Nhật Chúa Thăng Thiên', season: 'easter' };
    const overridden = fixed?.solemnity ? fixed : null;
    if (overridden) return { label: overridden.label, season: overridden.season };
    const sun = mostRecentSunday(date);
    const w = diffWeeks(sun, easter) + 1;
    return isSunday
      ? { label: `Chúa Nhật ${ROMAN[w - 1]} Phục Sinh`, season: 'easter' }
      : { label: `Tuần ${w} Phục Sinh`, season: 'easter' };
  }

  // Thường Niên phần 1 (sau Phép Rửa, trước Lễ Tro)
  if (date.getTime() > baptism.getTime() && date.getTime() < ash.getTime()) {
    const overridden = applyFixedIfWeekday();
    if (overridden) return { label: overridden.label, season: overridden.season };
    const firstMonday = addDays(baptism, 1);
    const days = Math.round((date - firstMonday) / DAY_MS);
    if (days < 6) return { label: 'Tuần I Thường Niên', season: 'ordinary' };
    const sun = mostRecentSunday(date);
    const w = 2 + diffWeeks(sun, addDays(firstMonday, 6));
    return isSunday
      ? { label: `Chúa Nhật ${ROMAN[w - 1]} Thường Niên`, season: 'ordinary' }
      : { label: `Tuần ${w} Thường Niên`, season: 'ordinary' };
  }

  // Thường Niên phần 2 (sau Hiện Xuống, trước Mùa Vọng)
  if (date.getTime() > pentecost.getTime() && date.getTime() < adventStart.getTime()) {
    const trinity = addDays(pentecost, 7);
    const overridden = fixed?.solemnity ? fixed : (date.getTime() >= trinity.getTime() ? applyFixedIfWeekday() : null);
    if (overridden) return { label: overridden.label, season: overridden.season };

    if (date.getTime() < trinity.getTime()) {
      const w = 34 - diffWeeks(christKing, trinity);
      return { label: `Tuần ${w} Thường Niên`, season: 'ordinary' };
    }
    if (sameDate(date, trinity)) {
      const w = 34 - diffWeeks(christKing, trinity);
      return { label: `Chúa Nhật ${ROMAN[w - 1]} TN - Chúa Ba Ngôi`, season: 'ordinary' };
    }
    if (sameDate(date, christKing)) {
      const w = 34 - diffWeeks(christKing, christKing);
      return { label: `Chúa Nhật ${ROMAN[w - 1]} TN - Chúa Kitô Vua`, season: 'ordinary' };
    }
    const sun = mostRecentSunday(date);
    const w = 34 - diffWeeks(christKing, sun);
    return isSunday
      ? { label: `Chúa Nhật ${ROMAN[w - 1]} Thường Niên`, season: 'ordinary' }
      : { label: `Tuần ${w} Thường Niên`, season: 'ordinary' };
  }

  return { label: '', season: 'ordinary' };
}

/** Tiện ích: lấy thông tin phụng vụ từ 1 đối tượng Date của JS (giờ địa phương) */
export function getLiturgicalInfoForDate(date) {
  return getLiturgicalInfo(date.getFullYear(), date.getMonth() + 1, date.getDate());
}
