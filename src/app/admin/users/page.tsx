"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Users,
  Search,
  Filter,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  UserPlus,
  MoreVertical
} from "lucide-react"

interface User {
  id: string
  email: string
  name: string | null
  phone: string | null
  role: string
  avatar: string | null
  createdAt: string
  emailVerified: Date | null
  specialization: string | null
  licenseNumber: string | null
  hasOfflineConsultation: boolean | null
  hasOnlineConsultation: boolean | null
  pharmacyName: string | null
  pharmacyAddress: string | null
  pharmacyLicenseNumber: string | null
  accounts: Array<{
    provider: string
    provider_account_id: string
  }>
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

const roleLabels: Record<string, string> = {
  PATIENT: "환자",
  DOCTOR: "의사",
  PHARMACY: "약사",
  ADMIN: "관리자"
}

const roleColors: Record<string, string> = {
  PATIENT: "bg-patient",
  DOCTOR: "bg-doctor",
  PHARMACY: "bg-pharmacy",
  ADMIN: "bg-admin"
}

function AdminUsersContent() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const displayUser = session?.user || {
    name: "관리자",
    email: "admin@healthcare.com",
    image: "https://ui-avatars.com/api/?name=관리자&background=8B5CF6&color=fff"
  }

  // 사용자 목록 조회
  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (roleFilter !== 'ALL') {
        params.append('role', roleFilter)
      }

      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await fetch(`/api/admin/users?${params}`, {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('사용자 목록을 불러오는데 실패했습니다')
      }

      const data = await response.json()
      setUsers(data.users)
      setPagination(data.pagination)
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [pagination.page, roleFilter])

  // 검색 처리
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchUsers()
  }

  // 사용자 수정
  const handleEditUser = async () => {
    if (!editingUser) return

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: editingUser.id,
          data: {
            name: editingUser.name,
            phone: editingUser.phone,
            role: editingUser.role,
            specialization: editingUser.specialization,
            licenseNumber: editingUser.licenseNumber,
            pharmacyName: editingUser.pharmacyName,
            pharmacyAddress: editingUser.pharmacyAddress,
            pharmacyLicenseNumber: editingUser.pharmacyLicenseNumber
          }
        })
      })

      if (!response.ok) {
        throw new Error('사용자 정보 수정에 실패했습니다')
      }

      setIsEditDialogOpen(false)
      setEditingUser(null)
      fetchUsers()
    } catch (err) {
      console.error('Failed to update user:', err)
      alert('사용자 정보 수정에 실패했습니다')
    }
  }

  // 사용자 삭제
  const handleDeleteUser = async () => {
    if (!deletingUser) return

    try {
      const response = await fetch(`/api/admin/users?userId=${deletingUser.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('사용자 삭제에 실패했습니다')
      }

      setIsDeleteDialogOpen(false)
      setDeletingUser(null)
      fetchUsers()
    } catch (err) {
      console.error('Failed to delete user:', err)
      alert('사용자 삭제에 실패했습니다')
    }
  }

  return (
    <DashboardLayout userRole="admin" user={displayUser}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">사용자 관리</h2>
            <p className="text-gray-600 mt-1">시스템에 등록된 모든 사용자를 관리합니다</p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Users className="w-4 h-4 mr-2" />
            총 {pagination.total}명
          </Badge>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* 검색 */}
              <div className="flex-1">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="이름, 이메일, 전화번호로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={handleSearch} variant="admin">
                    검색
                  </Button>
                </div>
              </div>

              {/* 역할 필터 */}
              <div className="w-full md:w-48">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="역할 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">전체 역할</SelectItem>
                    <SelectItem value="PATIENT">환자</SelectItem>
                    <SelectItem value="DOCTOR">의사</SelectItem>
                    <SelectItem value="PHARMACY">약사</SelectItem>
                    <SelectItem value="ADMIN">관리자</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">사용자가 없습니다</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>사용자</TableHead>
                      <TableHead>역할</TableHead>
                      <TableHead>연락처</TableHead>
                      <TableHead>가입일</TableHead>
                      <TableHead>로그인 방식</TableHead>
                      <TableHead className="text-right">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.avatar || undefined} />
                              <AvatarFallback className="bg-gray-200">
                                {user.name?.charAt(0) || user.email.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name || '이름 없음'}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${roleColors[user.role]} text-white`}>
                            {roleLabels[user.role]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.phone || '-'}
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                        </TableCell>
                        <TableCell>
                          {user.accounts.length > 0 ? (
                            <div className="flex gap-1">
                              {user.accounts.map((account, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {account.provider}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-xs">이메일</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingUser(user)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setDeletingUser(user)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-600">
                    {pagination.total}명 중 {((pagination.page - 1) * pagination.limit) + 1}-
                    {Math.min(pagination.page * pagination.limit, pagination.total)}명 표시
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === 1}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      이전
                    </Button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter(p => {
                          return p === 1 ||
                                 p === pagination.totalPages ||
                                 Math.abs(p - pagination.page) <= 1
                        })
                        .map((p, idx, arr) => (
                          <div key={p} className="flex items-center">
                            {idx > 0 && arr[idx - 1] !== p - 1 && (
                              <span className="px-2 text-gray-400">...</span>
                            )}
                            <Button
                              variant={p === pagination.page ? "admin" : "outline"}
                              size="sm"
                              onClick={() => setPagination(prev => ({ ...prev, page: p }))}
                            >
                              {p}
                            </Button>
                          </div>
                        ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === pagination.totalPages}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                      다음
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>사용자 정보 수정</DialogTitle>
              <DialogDescription>
                사용자의 정보를 수정합니다. 이메일은 변경할 수 없습니다.
              </DialogDescription>
            </DialogHeader>
            {editingUser && (
              <div className="space-y-4 py-4">
                {/* 기본 정보 */}
                <div className="space-y-2">
                  <Label>이메일</Label>
                  <Input value={editingUser.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label>이름</Label>
                  <Input
                    value={editingUser.name || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>전화번호</Label>
                  <Input
                    value={editingUser.phone || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>역할</Label>
                  <Select
                    value={editingUser.role}
                    onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PATIENT">환자</SelectItem>
                      <SelectItem value="DOCTOR">의사</SelectItem>
                      <SelectItem value="PHARMACY">약사</SelectItem>
                      <SelectItem value="ADMIN">관리자</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 의사 전용 정보 */}
                {editingUser.role === 'DOCTOR' && (
                  <>
                    <div className="space-y-2">
                      <Label>전문 분야</Label>
                      <Input
                        value={editingUser.specialization || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, specialization: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>면허 번호</Label>
                      <Input
                        value={editingUser.licenseNumber || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, licenseNumber: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* 약사 전용 정보 */}
                {editingUser.role === 'PHARMACY' && (
                  <>
                    <div className="space-y-2">
                      <Label>약국명</Label>
                      <Input
                        value={editingUser.pharmacyName || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, pharmacyName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>약국 주소</Label>
                      <Input
                        value={editingUser.pharmacyAddress || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, pharmacyAddress: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>약국 면허 번호</Label>
                      <Input
                        value={editingUser.pharmacyLicenseNumber || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, pharmacyLicenseNumber: e.target.value })}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                취소
              </Button>
              <Button variant="admin" onClick={handleEditUser}>
                저장
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>사용자 삭제</DialogTitle>
              <DialogDescription>
                정말로 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </DialogDescription>
            </DialogHeader>
            {deletingUser && (
              <div className="py-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={deletingUser.avatar || undefined} />
                    <AvatarFallback>
                      {deletingUser.name?.charAt(0) || deletingUser.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{deletingUser.name || '이름 없음'}</p>
                    <p className="text-sm text-gray-600">{deletingUser.email}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                취소
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser}>
                삭제
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

export default function AdminUsersPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminUsersContent />
    </ProtectedRoute>
  )
}
