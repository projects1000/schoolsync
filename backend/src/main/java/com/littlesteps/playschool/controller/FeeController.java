package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.dto.FeeInvoiceDTO;
import com.littlesteps.playschool.service.FeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/fees")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
@PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
public class FeeController {

    @Autowired
    private FeeService feeService;

    @GetMapping
    public ResponseEntity<?> getAllInvoices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(feeService.getAllInvoices(pageable));
    }

    @PostMapping("/invoice")
    public ResponseEntity<FeeInvoiceDTO> createInvoice(@RequestBody FeeInvoiceDTO dto) {
        try {
            FeeInvoiceDTO created = feeService.createInvoice(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<FeeInvoiceDTO> markAsPaid(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        try {
            String paymentMethod = request.getOrDefault("paymentMethod", "CASH");
            String transactionId = request.get("transactionId");
            FeeInvoiceDTO updated = feeService.markAsPaid(id, paymentMethod, transactionId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/report")
    public ResponseEntity<Map<String, Object>> getFeeReport() {
        return ResponseEntity.ok(feeService.getFeeReport());
    }
}
