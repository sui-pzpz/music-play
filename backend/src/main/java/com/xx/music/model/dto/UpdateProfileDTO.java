package com.xx.music.model.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileDTO {

    @Size(min = 2, max = 20, message = "昵称长度2-20位")
    private String nickname;

    private String avatar;

    @Min(0)
    @Max(2)
    private Integer gender;

    private String birthday;

    @Size(max = 100, message = "签名最多100字")
    private String signature;
}
