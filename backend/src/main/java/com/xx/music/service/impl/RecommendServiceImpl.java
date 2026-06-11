package com.xx.music.service.impl;

import com.xx.music.model.entity.Song;
import com.xx.music.model.entity.SongArtist;
import com.xx.music.model.vo.HotSongVO;
import com.xx.music.model.vo.HotVO;
import com.xx.music.model.vo.NewSongVO;
import com.xx.music.model.vo.PersonalizedVO;
import com.xx.music.model.vo.SongVO;
import com.xx.music.repository.ArtistRepository;
import com.xx.music.repository.PlayHistoryRepository;
import com.xx.music.repository.SongArtistRepository;
import com.xx.music.repository.SongRepository;
import com.xx.music.service.RecommendService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendServiceImpl implements RecommendService {

    private final SongRepository songRepository;
    private final PlayHistoryRepository playHistoryRepository;
    private final SongArtistRepository songArtistRepository;
    private final ArtistRepository artistRepository;

    @Override
    public PersonalizedVO getPersonalized(String uid, int size) {
        // 简化版本：返回最近热门歌曲作为推荐
        Pageable pageable = PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "playCount"));
        List<Song> songs = songRepository.findByStatus(1, pageable).getContent();

        List<SongVO> songVOList = songs.stream()
                .map(this::buildSongVO)
                .collect(Collectors.toList());

        PersonalizedVO vo = new PersonalizedVO();
        vo.setSongs(songVOList);
        return vo;
    }

    @Override
    public HotVO getHot(String type, int size) {
        Pageable pageable = PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "playCount"));
        List<Song> songs = songRepository.findByStatus(1, pageable).getContent();

        List<HotSongVO> hotSongVOList = new ArrayList<>();
        for (int i = 0; i < songs.size(); i++) {
            Song song = songs.get(i);
            HotSongVO hotSongVO = new HotSongVO();
            hotSongVO.setRank(i + 1);
            hotSongVO.setSongId(song.getSongId());
            hotSongVO.setName(song.getName());
            hotSongVO.setDuration(song.getDuration());
            hotSongVO.setIsVip(song.getIsVip());
            hotSongVO.setPlayCount(song.getPlayCount());

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
            hotSongVO.setArtistNames(artistNames);
            hotSongVO.setArtistIds(artistIds);

            hotSongVOList.add(hotSongVO);
        }

        HotVO vo = new HotVO();
        vo.setType(type);
        vo.setSongs(hotSongVOList);
        return vo;
    }

    @Override
    public List<NewSongVO> getNewSongs(int size) {
        Pageable pageable = PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<Song> songs = songRepository.findByStatus(1, pageable).getContent();

        return songs.stream()
                .map(song -> {
                    NewSongVO vo = new NewSongVO();
                    vo.setSongId(song.getSongId());
                    vo.setName(song.getName());
                    vo.setDuration(song.getDuration());
                    vo.setIsVip(song.getIsVip());
                    vo.setCreatedAt(song.getCreatedAt());

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
                })
                .collect(Collectors.toList());
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
