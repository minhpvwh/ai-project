import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Card, 
  Input, 
  Button, 
  Select, 
  Typography, 
  Space, 
  Row, 
  Col, 
  Empty, 
  App,
  Pagination
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  ClearOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { documentApi } from '@/api/documentApi';
import DocumentCard from '@/components/DocumentCard';
import { Document, DocumentSearchRequest, DocumentSearchResponse } from '@/types';

const { Title, Text } = Typography;
const { Option } = Select;

interface SearchFilters {
  q: string;
  tags: string[];
  visibility: string;
  my: boolean;
}

const Search: React.FC = () => {
  const { message } = App.useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(12);

  const [filters, setFilters] = useState<SearchFilters>({
    q: searchParams.get('q') || '',
    tags: searchParams.get('tags')?.split(',').filter(tag => tag.trim()) || [],
    visibility: searchParams.get('visibility') || '',
    my: searchParams.get('my') === 'true'
  });

  useEffect(() => {
    // Luôn load tài liệu khi vào trang (mặc định hiển thị tất cả)
    handleSearch()
  }, [])

  const handleSearch = async (page: number = 0) => {
    setIsLoading(true);
    try {
      const params: DocumentSearchRequest = {
        page,
        size: pageSize
      };

      if (filters.q.trim()) {
        params.query = filters.q.trim();
      }

      if (filters.tags.length > 0) {
        params.tags = filters.tags;
      }

      if (filters.visibility) {
        params.visibility = filters.visibility as 'PRIVATE' | 'GROUP' | 'PUBLIC';
      }

      const response: DocumentSearchResponse = filters.my 
        ? await documentApi.getMyDocuments(page, pageSize)
        : await documentApi.search(params);

      // Transform DocumentDto to Document
      const transformedDocuments = response.content.map(dto => ({
        ...dto,
        filePath: '', // Add missing filePath property
        owner: {
          id: dto.ownerId,
          username: dto.ownerName,
          fullName: dto.ownerName,
          email: '',
          roles: [],
          createdAt: ''
        }
      }));

      setDocuments(transformedDocuments);
      setCurrentPage(response.number);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      message.error('Không thể tìm kiếm tài liệu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    updateSearchParams();
    handleSearch(0);
  };

  const handlePageChange = (page: number, size?: number) => {
    const newPage = page - 1; // Ant Design pagination starts from 1, but API starts from 0
    setCurrentPage(newPage);
    if (size && size !== pageSize) {
      setPageSize(size);
    }
    handleSearch(newPage);
  };

  const updateSearchParams = () => {
    const newParams = new URLSearchParams();
    
    if (filters.q.trim()) newParams.set('q', filters.q.trim());
    if (filters.tags.length > 0) newParams.set('tags', filters.tags.join(','));
    if (filters.visibility) newParams.set('visibility', filters.visibility);
    if (filters.my) newParams.set('my', 'true');

    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({
      q: '',
      tags: [],
      visibility: '',
      my: false
    });
    setSearchParams({});
    setDocuments([]);
  };

  const hasActiveFilters = filters.q || filters.tags.length > 0 || filters.visibility || filters.my;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ margin: 0, marginBottom: '8px' }}>
          {filters.my ? 'Tài liệu của tôi' : 'Tìm kiếm tài liệu'}
        </Title>
        <Text type="secondary" style={{ fontSize: '16px' }}>
          {filters.my 
            ? 'Quản lý và xem tất cả tài liệu bạn đã upload'
            : 'Tìm kiếm tài liệu theo tiêu đề, tags hoặc nội dung'
          }
        </Text>
      </div>

      {/* Search Form */}
      <Card style={{ marginBottom: '24px' }}>
        <form onSubmit={handleSubmit}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Row gutter={16} align="middle">
              <Col flex="auto">
                <Input
                  size="large"
                  placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
                  prefix={<SearchOutlined />}
                  value={filters.q}
                  onChange={(e) => setFilters(prev => ({ ...prev, q: e.target.value }))}
                  onPressEnter={handleSubmit}
                />
              </Col>
              <Col>
                <Button 
                  type="primary" 
                  size="large"
                  htmlType="submit"
                  loading={isLoading}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none'
                  }}
                >
                  Tìm kiếm
                </Button>
              </Col>
            </Row>

            {/* Advanced Filters */}
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <div>
                  <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                    Tags
                  </Text>
                  <Select
                    mode="tags"
                    placeholder="Nhập tags"
                    style={{ width: '100%' }}
                    value={filters.tags}
                    onChange={(tags) => setFilters(prev => ({ ...prev, tags }))}
                    tokenSeparators={[',']}
                  />
                </div>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <div>
                  <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                    Quyền truy cập
                  </Text>
                  <Select
                    placeholder="Tất cả"
                    style={{ width: '100%' }}
                    value={filters.visibility || undefined}
                    onChange={(visibility) => setFilters(prev => ({ ...prev, visibility }))}
                    allowClear
                  >
                    <Option value="PUBLIC">Công khai</Option>
                    <Option value="GROUP">Nhóm</Option>
                    <Option value="PRIVATE">Riêng tư</Option>
                  </Select>
                </div>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <div style={{ display: 'flex', alignItems: 'end', height: '100%' }}>
                  <Button
                    icon={<ClearOutlined />}
                    onClick={clearFilters}
                    style={{ width: '100%' }}
                    disabled={!hasActiveFilters}
                  >
                    Xóa bộ lọc
                  </Button>
                </div>
              </Col>
            </Row>
          </Space>
        </form>
      </Card>

      {/* Results */}
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {documents.length > 0 ? (
          <>
            <Row justify="space-between" align="middle">
              <Col>
                <Text type="secondary">
                  Tìm thấy {totalElements} tài liệu
                  {totalPages > 1 && ` (trang ${currentPage + 1}/${totalPages})`}
                </Text>
              </Col>
              {hasActiveFilters && (
                <Col>
                  <Space>
                    <FilterOutlined style={{ color: '#8c8c8c' }} />
                    <Text type="secondary">Đang áp dụng bộ lọc</Text>
                  </Space>
                </Col>
              )}
            </Row>

            <Row gutter={[16, 16]}>
              {documents.map((document: Document) => (
                <Col xs={24} sm={12} lg={8} key={document.id}>
                  <DocumentCard document={document} />
                </Col>
              ))}
            </Row>

            {totalPages > 1 && (
              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <Pagination
                  current={currentPage + 1}
                  total={totalElements}
                  pageSize={pageSize}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total, range) => 
                    `${range[0]}-${range[1]} của ${total} tài liệu`
                  }
                  pageSizeOptions={['6', '12', '24', '48']}
                  onChange={handlePageChange}
                  onShowSizeChange={handlePageChange}
                  style={{
                    display: 'inline-block'
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <Empty
            image={<SearchOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />}
            description={
              <div>
                <Title level={4} style={{ color: '#8c8c8c' }}>
                  {filters.my ? 'Chưa có tài liệu nào' : 'Không tìm thấy tài liệu'}
                </Title>
                <Text type="secondary">
                  {filters.my 
                    ? 'Bạn chưa upload tài liệu nào. Hãy bắt đầu chia sẻ kiến thức!'
                    : 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
                  }
                </Text>
              </div>
            }
          >
            {filters.my ? (
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                href="/upload"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                Upload tài liệu đầu tiên
              </Button>
            ) : (
              <Button onClick={clearFilters}>
                Xóa bộ lọc
              </Button>
            )}
          </Empty>
        )}
      </Space>
    </div>
  );
}

export default Search
