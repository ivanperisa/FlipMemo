namespace FlipMemo.DTOs.Password;

public class ResetPasswordBodyDto
{
    public string NewPassword { get; set; } = null!;
    public string ConfirmNewPassword { get; set; } = null!;
}
