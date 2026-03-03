package com.littlesteps.playschool.dto;

import java.util.List;

public class SecurityLogsResponse {

    private List<AuditLogDTO> loginHistory;
    private List<AuditLogDTO> activityLogs;
    private List<AuditLogDTO> dataChangeLogs;
    private SecurityStats securityStats;

    public SecurityLogsResponse(List<AuditLogDTO> loginHistory, List<AuditLogDTO> activityLogs,
            List<AuditLogDTO> dataChangeLogs, SecurityStats securityStats) {
        this.loginHistory = loginHistory;
        this.activityLogs = activityLogs;
        this.dataChangeLogs = dataChangeLogs;
        this.securityStats = securityStats;
    }

    public List<AuditLogDTO> getLoginHistory() {
        return loginHistory;
    }

    public void setLoginHistory(List<AuditLogDTO> loginHistory) {
        this.loginHistory = loginHistory;
    }

    public List<AuditLogDTO> getActivityLogs() {
        return activityLogs;
    }

    public void setActivityLogs(List<AuditLogDTO> activityLogs) {
        this.activityLogs = activityLogs;
    }

    public List<AuditLogDTO> getDataChangeLogs() {
        return dataChangeLogs;
    }

    public void setDataChangeLogs(List<AuditLogDTO> dataChangeLogs) {
        this.dataChangeLogs = dataChangeLogs;
    }

    public SecurityStats getSecurityStats() {
        return securityStats;
    }

    public void setSecurityStats(SecurityStats securityStats) {
        this.securityStats = securityStats;
    }

    public static class SecurityStats {
        private long totalLogins24h;
        private long failedLogins24h;
        private long activeSessions;
        private long blockedIPs;
        private String lastSecurityAudit;

        public SecurityStats() {
        }

        public long getTotalLogins24h() {
            return totalLogins24h;
        }

        public void setTotalLogins24h(long totalLogins24h) {
            this.totalLogins24h = totalLogins24h;
        }

        public long getFailedLogins24h() {
            return failedLogins24h;
        }

        public void setFailedLogins24h(long failedLogins24h) {
            this.failedLogins24h = failedLogins24h;
        }

        public long getActiveSessions() {
            return activeSessions;
        }

        public void setActiveSessions(long activeSessions) {
            this.activeSessions = activeSessions;
        }

        public long getBlockedIPs() {
            return blockedIPs;
        }

        public void setBlockedIPs(long blockedIPs) {
            this.blockedIPs = blockedIPs;
        }

        public String getLastSecurityAudit() {
            return lastSecurityAudit;
        }

        public void setLastSecurityAudit(String lastSecurityAudit) {
            this.lastSecurityAudit = lastSecurityAudit;
        }
    }
}
