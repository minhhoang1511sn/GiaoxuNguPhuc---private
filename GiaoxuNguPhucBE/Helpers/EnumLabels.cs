using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Models;

namespace GiaoxuNguPhucBE.Helpers
{
    /// <summary>
    /// Nhãn tiếng Việt hiển thị cho từng giá trị enum. Đây là nguồn dữ liệu DUY NHẤT
    /// cho các dropdown/filter ở trang quản trị — trước đây các nhãn này bị viết cứng
    /// lặp lại ở nhiều file frontend (course/page.jsx, dang-ki/page.jsx, ministry/page.jsx,
    /// clergy/page.jsx, post/page.jsx). Muốn đổi nhãn hoặc thêm lựa chọn mới, chỉ cần sửa ở đây.
    /// </summary>
    public static class EnumLabels
    {
        public static readonly Dictionary<RegistrationClassType, string> ClassType = new()
        {
            [RegistrationClassType.KhaiTam] = "Khai Tâm",
            [RegistrationClassType.RuocLe] = "Xưng Tội - Rước Lễ",
            [RegistrationClassType.ThemSuc] = "Thêm Sức",
            [RegistrationClassType.BaoDong] = "Bao Đồng",
            [RegistrationClassType.DuTong] = "Dự Tòng (RCIA)",
            [RegistrationClassType.GiaoLyHonNhan] = "Giáo lý Hôn nhân",
            [RegistrationClassType.Khac] = "Khác (khóa học tự do)",
        };

        public static readonly Dictionary<PostCategory, string> PostCategory = new()
        {
            [Models.PostCategory.TinTuc] = "Tin tức",
            [Models.PostCategory.ThongBao] = "Thông báo",
            [Models.PostCategory.GiaoLy] = "Giáo lý",
            [Models.PostCategory.SuyNiem] = "Suy niệm",
            [Models.PostCategory.HoatDongDoanThe] = "Hoạt động đoàn thể",
            [Models.PostCategory.LichPhungVu] = "Lịch Phụng vụ",
            [Models.PostCategory.CaoPho] = "Cáo phó",
            [Models.PostCategory.HinhAnhVideo] = "Hình ảnh - Video",
            [Models.PostCategory.Khac] = "Khác",
            [Models.PostCategory.GioiTre] = "Giới Trẻ",
        };

        public static readonly Dictionary<PostStatus, string> PostStatus = new()
        {
            [Models.PostStatus.Draft] = "Bản nháp",
            [Models.PostStatus.Published] = "Đã đăng",
            [Models.PostStatus.Archived] = "Lưu trữ",
        };

        public static readonly Dictionary<MinistryCategory, string> MinistryCategory = new()
        {
            [Models.MinistryCategory.Liturgy] = "Phụng vụ",
            [Models.MinistryCategory.Youth] = "Giới trẻ",
            [Models.MinistryCategory.Charity] = "Xã hội & Bác ái",
            [Models.MinistryCategory.Education] = "Giáo dục",
        };

        public static readonly Dictionary<ClergyType, string> ClergyType = new()
        {
            [Models.ClergyType.LinhMuc] = "Linh mục",
            [Models.ClergyType.ThayXu] = "Thầy xứ / Phó tế",
            [Models.ClergyType.TuSi] = "Tu sĩ (Sr.)",
            [Models.ClergyType.GiaoDan] = "Giáo dân phụ trách",
        };

        public static readonly Dictionary<RegistrationStatus, string> RegistrationStatus = new()
        {
            [Models.RegistrationStatus.Pending] = "Chờ duyệt",
            [Models.RegistrationStatus.Confirmed] = "Đã xác nhận",
            [Models.RegistrationStatus.Cancelled] = "Đã huỷ",
        };

        public static readonly Dictionary<UserApprovalStatus, string> UserApprovalStatus = new()
        {
            [Models.UserApprovalStatus.Pending] = "Chờ duyệt",
            [Models.UserApprovalStatus.Approved] = "Đã duyệt",
            [Models.UserApprovalStatus.Rejected] = "Đã từ chối",
        };

        /// <summary>Chuyển 1 Dictionary&lt;TEnum,string&gt; thành list EnumOptionDto theo đúng thứ tự khai báo enum</summary>
        public static List<EnumOptionDto> ToOptions<TEnum>(Dictionary<TEnum, string> labels) where TEnum : struct, Enum
        {
            return Enum.GetValues<TEnum>()
                .Select(v => new EnumOptionDto(
                    v.ToString(),
                    Convert.ToInt32(v),
                    labels.TryGetValue(v, out var label) ? label : v.ToString()
                ))
                .ToList();
        }
    }
}
