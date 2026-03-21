<<<<<<< HEAD
package org.example.backend.user.dto;

import lombok.*;

import java.io.Serializable;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LogDTO implements Serializable {
    Long id;
    Instant timesTamp;
    String logLevel;
    String module;
    String actionType;
    String logContent;
    String sourceIp;
    String userAgent;
    String affectedTable;
    String beforeData;
    String afterData;
    String national;
=======
package org.example.backend.user.dto;

import lombok.*;

import java.io.Serializable;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LogDTO implements Serializable {
    Long id;
    Instant timesTamp;
    String logLevel;
    String module;
    String actionType;
    String logContent;
    String sourceIp;
    String userAgent;
    String affectedTable;
    String beforeData;
    String afterData;
    String national;
>>>>>>> 68ea31269c997b6a0ebcf59ee12b0c1134d0dc15
}