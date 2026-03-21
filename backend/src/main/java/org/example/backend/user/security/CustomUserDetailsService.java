<<<<<<< HEAD
package org.example.backend.user.security;

import lombok.RequiredArgsConstructor;
import org.example.backend.user.entity.User;
import org.example.backend.user.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        User user = userRepository.findByUsernameOrEmailWithRole(usernameOrEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword()!= null ? user.getPassword() : "")
                .authorities(new SimpleGrantedAuthority(user.getRole().getRoleName()))
                .build();
    }

}

=======
package org.example.backend.user.security;

import lombok.RequiredArgsConstructor;
import org.example.backend.user.entity.User;
import org.example.backend.user.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        User user = userRepository.findByUsernameOrEmailWithRole(usernameOrEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword()!= null ? user.getPassword() : "")
                .authorities(new SimpleGrantedAuthority(user.getRole().getRoleName()))
                .build();
    }

}

>>>>>>> 68ea31269c997b6a0ebcf59ee12b0c1134d0dc15
