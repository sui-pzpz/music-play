package com.xx.music.model.vo;

import lombok.Data;

import java.util.List;

@Data
public class NewSongVO {

    private String songId;
    private String name;
    private List<ArtistVO> artists;
    private AlbumVO album;
    private Integer duration;
    private String coverUrl;
    private String publishDate;
}
