package com.xx.music.model.vo;

import com.xx.music.common.PageResult;
import lombok.Data;

import java.util.List;

@Data
public class SearchResultVO {

    private List<SongVO> songs;
    private List<PlaylistVO> playlists;
    private List<ArtistVO> artists;
    private PageResult.Pagination pagination;
}
