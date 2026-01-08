namespace FlipMemo.DTOs.Password;

public class ChangePasswordRequestDto
{
    public string CurrentPassword { get; set; }
    public string NewPassword { get; set; }
    public string ConfirmNewPassword { get; set; }
}
