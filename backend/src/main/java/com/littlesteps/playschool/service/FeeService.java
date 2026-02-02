package com.littlesteps.playschool.service;

import com.littlesteps.playschool.dto.FeeInvoiceDTO;
import com.littlesteps.playschool.entity.FeeInvoice;
import com.littlesteps.playschool.entity.Student;
import com.littlesteps.playschool.repository.FeeInvoiceRepository;
import com.littlesteps.playschool.repository.StudentRepository;
import com.littlesteps.playschool.security.SchoolContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FeeService {

        @Autowired
        private FeeInvoiceRepository feeInvoiceRepository;

        @Autowired
        private StudentRepository studentRepository;

        @Autowired
        private MongoTemplate mongoTemplate;

        public List<FeeInvoiceDTO> getAllInvoices() {
                String schoolId = SchoolContext.getSchoolId();
                System.out.println("[DEBUG FeeService] getAllInvoices - schoolId from context: '" + schoolId + "'");
                if (schoolId == null || schoolId.isEmpty()) {
                        System.out.println("[DEBUG FeeService] schoolId is null/empty, returning empty list");
                        return List.of(); // Return empty list if no schoolId (new school with no invoices)
                }
                List<FeeInvoice> invoices = feeInvoiceRepository.findBySchoolId(schoolId);
                System.out.println(
                                "[DEBUG FeeService] Found " + invoices.size() + " invoices for schoolId: " + schoolId);
                return invoices.stream().map(this::convertToDTO).collect(Collectors.toList());
        }

        public FeeInvoiceDTO createInvoice(FeeInvoiceDTO dto) {
                Student student = studentRepository.findById(dto.getStudentId())
                                .orElseThrow(() -> new RuntimeException("Student not found"));

                FeeInvoice invoice = new FeeInvoice();
                invoice.setInvoiceNo(generateInvoiceNo());
                invoice.setStudent(student);
                invoice.setAmount(dto.getAmount());
                invoice.setFeeType(dto.getFeeType());
                invoice.setDueDate(dto.getDueDate());
                invoice.setStatus(FeeInvoice.Status.PENDING);
                invoice.setSchoolId(SchoolContext.getSchoolId());
                invoice.setCreatedAt(LocalDateTime.now());

                FeeInvoice saved = feeInvoiceRepository.save(invoice);
                return convertToDTO(saved);
        }

        public FeeInvoiceDTO markAsPaid(String invoiceId, String paymentMethod, String transactionId) {
                FeeInvoice invoice = feeInvoiceRepository.findById(invoiceId)
                                .orElseThrow(() -> new RuntimeException("Invoice not found"));

                invoice.setStatus(FeeInvoice.Status.PAID);
                invoice.setPaidDate(LocalDate.now());
                invoice.setPaymentMethod(paymentMethod);
                invoice.setTransactionId(transactionId);
                invoice.setUpdatedAt(LocalDateTime.now());

                FeeInvoice saved = feeInvoiceRepository.save(invoice);
                return convertToDTO(saved);
        }

        public Map<String, Object> getFeeReport() {
                String schoolId = SchoolContext.getSchoolId();
                Map<String, Object> report = new HashMap<>();

                if (schoolId == null || schoolId.isEmpty()) {
                        // Return empty report for new school
                        report.put("totalAmount", BigDecimal.ZERO);
                        report.put("collectedAmount", BigDecimal.ZERO);
                        report.put("pendingAmount", BigDecimal.ZERO);
                        report.put("totalInvoices", 0L);
                        report.put("paidCount", 0L);
                        report.put("pendingCount", 0L);
                        report.put("overdueCount", 0L);
                        report.put("collectionRate", BigDecimal.ZERO);
                        return report;
                }

                List<FeeInvoice> allInvoices = feeInvoiceRepository.findBySchoolId(schoolId);

                // Calculate totals
                BigDecimal totalAmount = allInvoices.stream()
                                .map(FeeInvoice::getAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal collectedAmount = allInvoices.stream()
                                .filter(inv -> inv.getStatus() == FeeInvoice.Status.PAID)
                                .map(FeeInvoice::getAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal pendingAmount = allInvoices.stream()
                                .filter(inv -> inv.getStatus() == FeeInvoice.Status.PENDING ||
                                                inv.getStatus() == FeeInvoice.Status.OVERDUE)
                                .map(FeeInvoice::getAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                long totalInvoices = allInvoices.size();
                long paidCount = allInvoices.stream().filter(i -> i.getStatus() == FeeInvoice.Status.PAID).count();
                long pendingCount = allInvoices.stream().filter(i -> i.getStatus() == FeeInvoice.Status.PENDING)
                                .count();
                long overdueCount = allInvoices.stream().filter(i -> i.getStatus() == FeeInvoice.Status.OVERDUE)
                                .count();

                report.put("totalAmount", totalAmount);
                report.put("collectedAmount", collectedAmount);
                report.put("pendingAmount", pendingAmount);
                report.put("totalInvoices", totalInvoices);
                report.put("paidCount", paidCount);
                report.put("pendingCount", pendingCount);
                report.put("overdueCount", overdueCount);
                report.put("collectionRate", totalAmount.compareTo(BigDecimal.ZERO) > 0
                                ? collectedAmount.multiply(BigDecimal.valueOf(100)).divide(totalAmount, 2,
                                                java.math.RoundingMode.HALF_UP)
                                : BigDecimal.ZERO);

                return report;
        }

        private String generateInvoiceNo() {
                return "INV-" + System.currentTimeMillis();
        }

        private FeeInvoiceDTO convertToDTO(FeeInvoice invoice) {
                FeeInvoiceDTO dto = new FeeInvoiceDTO();
                dto.setId(invoice.getId());
                dto.setInvoiceNo(invoice.getInvoiceNo());
                dto.setAmount(invoice.getAmount());
                dto.setFeeType(invoice.getFeeType());
                dto.setDueDate(invoice.getDueDate());
                dto.setStatus(invoice.getStatus() != null ? invoice.getStatus().name() : "PENDING");
                dto.setPaidDate(invoice.getPaidDate());
                dto.setPaymentMethod(invoice.getPaymentMethod());
                dto.setTransactionId(invoice.getTransactionId());

                if (invoice.getStudent() != null) {
                        dto.setStudentId(invoice.getStudent().getId());
                        dto.setStudentName(invoice.getStudent().getName());
                        dto.setClassName(invoice.getStudent().getClassName());
                } else {
                        dto.setStudentName("Unknown Student");
                        dto.setClassName("N/A");
                }

                return dto;
        }
}
