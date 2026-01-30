package com.littlesteps.playschool.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.TimeUnit;

@Service
public class BackupService {

    @Value("${backup.dir:./backups}")
    private String backupDir;

    @Value("${spring.data.mongodb.database:playschool}")
    private String databaseName;

    public String performBackup() {
        try {
            Path backupPath = Paths.get(backupDir);
            if (!Files.exists(backupPath)) {
                Files.createDirectories(backupPath);
            }

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String backupFile = "backup_" + timestamp;
            Path targetPath = backupPath.resolve(backupFile);

            // Command: mongodump --db playschool --out /path/to/backup
            ProcessBuilder pb = new ProcessBuilder(
                    "mongodump",
                    "--db", databaseName,
                    "--out", targetPath.toString());

            pb.redirectErrorStream(true);
            Process process = pb.start();
            boolean finished = process.waitFor(60, TimeUnit.SECONDS);

            if (finished && process.exitValue() == 0) {
                return "Backup created successfully at " + targetPath.toString();
            } else {
                return "Backup failed. Exit code: " + (finished ? process.exitValue() : "timeout");
            }
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Backup execution failed", e);
        }
    }

    // Restore logic would be similar using mongorestore
}
