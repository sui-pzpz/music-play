package com.xx.music.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateSongDTO {

    @NotBlank(message = "歌曲名称不能为空")
    private String name;

    @NotEmpty(message = "歌手列表不能为空")
    private List<@Valid ArtistItem> artistIds;

    private String albumId;

    @NotNull
    private Integer duration;

    private Boolean isVip;

    private List<String> qualities;

    @NotBlank(message = "来源不能为空")
    private String source;

    @NotBlank(message = "来源ID不能为空")
    private String sourceId;

    @Data
    public static class ArtistItem {

        @NotBlank
        private String artistId;

        @NotBlank
        private String role;

        private Integer sortOrder;
    }
}
