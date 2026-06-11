package com.xx.music.service.impl;

import com.xx.music.common.PageResult;
import com.xx.music.model.entity.SearchLog;
import com.xx.music.model.entity.Song;
import com.xx.music.model.entity.SongArtist;
import com.xx.music.model.vo.HotKeywordsVO;
import com.xx.music.model.vo.SearchResultVO;
import com.xx.music.model.vo.SongVO;
import com.xx.music.repository.*;
import com.xx.music.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private final SongRepository songRepository;
    private final SongArtistRepository songArtistRepository;
    private final ArtistRepository artistRepository;
    private final PlaylistRepository playlistRepository;
    private final SearchLogRepository searchLogRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String HOT_KEYWORDS_KEY = "search:hot_keywords";

    @Override
    public SearchResultVO search(String keyword, String type, int page, int size, String uid, String ip) {
        // 记录搜索日志
        try {
            SearchLog log = new SearchLog();
            log.setKeyword(keyword);
            log.setUid(uid);
            log.setIp(ip);
            log.setSearchType(type);
            log.setCreatedAt(LocalDateTime.now());
            searchLogRepository.save(log);
        } catch (Exception ignored) {
        }

        // 更新Redis热词计数
        try {
            redisTemplate.opsForZSet().incrementScore(HOT_KEYWORDS_KEY, keyword, 1);
        } catch (Exception ignored) {
        }

        SearchResultVO vo = new SearchResultVO();
        vo.setKeyword(keyword);
        vo.setType(type);

        switch (type != null ? type : "song") {
            case "playlist":
                vo.setPlaylists(searchPlaylists(keyword, page, size));
                break;
            case "artist":
                vo.setArtists(searchArtists(keyword, page, size));
                break;
            default:
                vo.setSongs(searchSong(keyword, page, size));
                break;
        }

        return vo;
    }

    @Override
    public PageResult<SongVO> searchSong(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);

        Page<Song> songPage = songRepository.findByNameContainingAndStatus(keyword, 1, pageable);

        List<SongVO> songVOList = songPage.getContent().stream()
                .map(this::buildSongVO)
                .collect(Collectors.toList());

        return PageResult.of(songVOList, songPage.getTotalElements(), page, size);
    }

    @Override
    public HotKeywordsVO getHotKeywords() {
        List<String> keywords = new ArrayList<>();

        // 先从Redis获取热词
        try {
            var hotWords = redisTemplate.opsForZSet().reverseRange(HOT_KEYWORDS_KEY, 0, 9);
            if (hotWords != null && !hotWords.isEmpty()) {
                for (Object word : hotWords) {
                    keywords.add(word.toString());
                }
            }
        } catch (Exception ignored) {
        }

        // 如果Redis没有数据，从数据库获取
        if (keywords.isEmpty()) {
            List<Object[]> dbHotWords = searchLogRepository.findTopKeywords(PageRequest.of(0, 10));
            for (Object[] row : dbHotWords) {
                keywords.add(row[0].toString());
            }
        }

        // 如果还没有数据，返回默认热词
        if (keywords.isEmpty()) {
            keywords.add("周杰伦");
            keywords.add("林俊杰");
            keywords.add("陈奕迅");
            keywords.add("薛之谦");
            keywords.add("邓紫棋");
            keywords.add("毛不易");
            keywords.add("李荣浩");
            keywords.add("华晨宇");
            keywords.add("Taylor Swift");
            keywords.add("五月天");
        }

        HotKeywordsVO vo = new HotKeywordsVO();
        vo.setKeywords(keywords);
        return vo;
    }

    private PageResult<SongVO> searchPlaylists(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        // 此处简化为返回空结果，实际需用PlaylistRepository搜索
        return PageResult.of(new ArrayList<>(), 0, page, size);
    }

    private PageResult<?> searchArtists(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        // 此处简化为返回空结果，实际需用ArtistRepository搜索
        return PageResult.of(new ArrayList<>(), 0, page, size);
    }

    private SongVO buildSongVO(Song song) {
        SongVO vo = new SongVO();
        vo.setSongId(song.getSongId());
        vo.setName(song.getName());
        vo.setDuration(song.getDuration());
        vo.setIsVip(song.getIsVip());
        vo.setPlayCount(song.getPlayCount());

        // 获取歌手信息
        List<SongArtist> songArtists = songArtistRepository.findBySongId(song.getId());
        List<String> artistNames = new ArrayList<>();
        List<String> artistIds = new ArrayList<>();
        for (SongArtist sa : songArtists) {
            artistRepository.findById(sa.getArtistId()).ifPresent(artist -> {
                artistNames.add(artist.getName());
                artistIds.add(artist.getArtistId());
            });
        }
        vo.setArtistNames(artistNames);
        vo.setArtistIds(artistIds);

        return vo;
    }
}
