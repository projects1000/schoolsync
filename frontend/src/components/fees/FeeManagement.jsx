import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, DollarSign, FileText, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import adminService from '@/services/adminService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Pagination from '../common/Pagination';

const FeeManagement = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [invoices, setInvoices] = useState([]);
    const [students, setStudents] = useState([]);
    const [report, setReport] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Pagination state
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        pageSize: 10
    });

    // Create Invoice Modal
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        studentId: '',
        amount: '',
        feeType: 'TUITION',
        dueDate: ''
    });

    // Pay Modal
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [currentInvoice, setCurrentInvoice] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [transactionId, setTransactionId] = useState('');

    const feeDataQuery = useQuery({
        queryKey: ['admin', 'fees-management', pagination.currentPage, pagination.pageSize],
        queryFn: async () => {
            const [invoicesResponse, studentsData, reportData] = await Promise.all([
                adminService.getFees({ page: pagination.currentPage, size: pagination.pageSize, sort: 'createdAt,desc' }),
                adminService.getStudents({ size: 1000 }),
                adminService.getFeeReport()
            ]);

            return {
                invoicesResponse,
                studentsData,
                reportData,
            };
        },
        staleTime: 1000 * 60,
        placeholderData: (previousData) => previousData,
    });

    useEffect(() => {
        if (!feeDataQuery.data) return;

        const { invoicesResponse, studentsData, reportData } = feeDataQuery.data;

        if (invoicesResponse && invoicesResponse.content) {
            setInvoices(invoicesResponse.content);
            setPagination(prev => ({
                ...prev,
                currentPage: invoicesResponse.number,
                totalPages: invoicesResponse.totalPages,
                totalElements: invoicesResponse.totalElements
            }));
        } else {
            setInvoices(invoicesResponse || []);
            setPagination(prev => ({
                ...prev,
                totalPages: 1,
                totalElements: (invoicesResponse || []).length
            }));
        }

        setStudents(studentsData.content || studentsData || []);
        setReport(reportData);
    }, [feeDataQuery.data]);

    useEffect(() => {
        if (!feeDataQuery.error) return;

        console.error('Failed to fetch data', feeDataQuery.error);
        toast({ title: 'Error', description: 'Failed to load fee data', variant: 'destructive' });
    }, [feeDataQuery.error, toast]);

    const loading = feeDataQuery.isLoading || feeDataQuery.isFetching;

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, currentPage: newPage }));
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            await adminService.createInvoice({
                ...formData,
                amount: parseFloat(formData.amount)
            });
            toast({ title: "Success", description: "Invoice created successfully" });
            setIsCreateModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['admin', 'fees-management'] });
            setFormData({ studentId: '', amount: '', feeType: 'TUITION', dueDate: '' });
        } catch (error) {
            toast({ title: "Error", description: "Failed to create invoice", variant: "destructive" });
        }
    };

    const handlePayClick = (invoice) => {
        setCurrentInvoice(invoice);
        setPaymentMethod('CASH');
        setTransactionId('');
        setIsPayModalOpen(true);
    };

    const handlePaySubmit = async () => {
        try {
            await adminService.markInvoicePaid(currentInvoice.id, paymentMethod, transactionId);
            toast({ title: "Success", description: "Payment recorded successfully" });
            setIsPayModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['admin', 'fees-management'] });
        } catch (error) {
            toast({ title: "Error", description: "Failed to record payment", variant: "destructive" });
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            PAID: { variant: 'success', icon: CheckCircle, className: 'bg-green-100 text-green-800' },
            PENDING: { variant: 'secondary', icon: Clock, className: 'bg-yellow-100 text-yellow-800' },
            OVERDUE: { variant: 'destructive', icon: AlertCircle, className: 'bg-red-100 text-red-800' },
            CANCELLED: { variant: 'outline', icon: AlertCircle, className: 'bg-gray-100 text-gray-600' }
        };
        const c = config[status] || config.PENDING;
        const Icon = c.icon;
        return (
            <Badge className={c.className}>
                <Icon className="w-3 h-3 mr-1" />
                {status}
            </Badge>
        );
    };

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch = inv.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const feeTypes = ['TUITION', 'ADMISSION', 'LIBRARY', 'TRANSPORT', 'EXAM', 'UNIFORM', 'OTHER'];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Fee Management</h1>
                    <p className="text-gray-500">Manage invoices and track payments</p>
                </div>
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Invoice
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Create New Invoice</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Student</Label>
                                <Select value={formData.studentId} onValueChange={(val) => setFormData(p => ({ ...p, studentId: val }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Student" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.admissionNo})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Fee Type</Label>
                                    <Select value={formData.feeType} onValueChange={(val) => setFormData(p => ({ ...p, feeType: val }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {feeTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Amount (₹)</Label>
                                    <Input type="number" value={formData.amount} onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Due Date</Label>
                                <Input type="date" value={formData.dueDate} onChange={(e) => setFormData(p => ({ ...p, dueDate: e.target.value }))} required />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Create Invoice</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Billed</CardTitle>
                        <DollarSign className="w-4 h-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{report.totalAmount || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Collected</CardTitle>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">₹{report.collectedAmount || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Pending</CardTitle>
                        <Clock className="w-4 h-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">₹{report.pendingAmount || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Collection Rate</CardTitle>
                        <FileText className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{report.collectionRate || 0}%</div>
                    </CardContent>
                </Card>
            </div>

            {/* Invoice Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by student or invoice..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="PAID">Paid</SelectItem>
                            <SelectItem value="OVERDUE">Overdue</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice No</TableHead>
                            <TableHead>Student</TableHead>
                            <TableHead>Fee Type</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                            </TableRow>
                        ) : filteredInvoices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                                    No invoices found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredInvoices.map((inv) => (
                                <TableRow key={inv.id}>
                                    <TableCell className="font-mono text-sm">{inv.invoiceNo}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{inv.studentName}</div>
                                        <div className="text-xs text-gray-500">{inv.className}</div>
                                    </TableCell>
                                    <TableCell>{inv.feeType}</TableCell>
                                    <TableCell className="font-semibold">₹{inv.amount}</TableCell>
                                    <TableCell>{inv.dueDate}</TableCell>
                                    <TableCell>{getStatusBadge(inv.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            {inv.status !== 'PAID' && (
                                                <Button variant="outline" size="sm" onClick={() => handlePayClick(inv)}>
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    Pay
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="sm" title="Download Receipt">
                                                <Download className="w-4 h-4 text-gray-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                
                <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalElements={pagination.totalElements}
                    pageSize={pagination.pageSize}
                    onPageChange={handlePageChange}
                />
            </div>

            {/* Pay Modal */}
            <Dialog open={isPayModalOpen} onOpenChange={setIsPayModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Record Payment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-gray-500">
                            Recording payment for Invoice <strong>{currentInvoice?.invoiceNo}</strong> - ₹{currentInvoice?.amount}
                        </p>
                        <div className="space-y-2">
                            <Label>Payment Method</Label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CASH">Cash</SelectItem>
                                    <SelectItem value="UPI">UPI</SelectItem>
                                    <SelectItem value="CARD">Card</SelectItem>
                                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Transaction ID (Optional)</Label>
                            <Input
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                placeholder="Enter transaction reference"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPayModalOpen(false)}>Cancel</Button>
                        <Button onClick={handlePaySubmit}>Confirm Payment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default FeeManagement;
