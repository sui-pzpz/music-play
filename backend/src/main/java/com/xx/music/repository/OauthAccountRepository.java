package com.xx.music.repository;

import com.xx.music.model.entity.OauthAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OauthAccountRepository extends JpaRepository<OauthAccount, Long> {

    Optional<OauthAccount> findByProviderAndOpenid(String provider, String openid);

    List<OauthAccount> findByUid(String uid);
}
