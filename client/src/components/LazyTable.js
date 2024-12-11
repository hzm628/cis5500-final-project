import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material';

export default function LazyTable({ route, columns, defaultPageSize, rowsPerPageOptions }) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1); // 1 indexed
  const [pageSize, setPageSize] = useState(defaultPageSize ?? 10);

  useEffect(() => {
    fetch(`${route}?page=${page}&page_size=${pageSize}`)
      .then((res) => res.json())
      .then((resJson) => setData(resJson))
      .catch((err) => console.error('Error fetching data:', err));
  }, [route, page, pageSize]);

  const handleChangePage = (e, newPage) => {
    if (newPage < page || data.length === pageSize) {
      setPage(newPage + 1); // Adjust for 0-indexed page from pagination
    }
  };

  const handleChangePageSize = (e) => {
    const newPageSize = e.target.value;
    setPageSize(newPageSize);
    setPage(1); // Reset to first page
  };

  const defaultRenderCell = (col, row) => (
    <div>{row[col.field]}</div>
  );

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.headerName}
                sx={{
                  minWidth: col.minWidth || 150, // Set a minimum width for the column
                  maxWidth: col.maxWidth || 300, // Optionally set a max width
                }}
              >
                {col.headerName}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={idx}>
              {columns.map((col) => (
                <TableCell
                  key={col.headerName}
                  sx={{
                    minWidth: col.minWidth || 150, // Match the column width for consistency
                    maxWidth: col.maxWidth || 300,
                  }}
                >
                  {col.renderCell ? col.renderCell(row) : defaultRenderCell(col, row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions ?? [5, 10, 25]}
        count={-1} // Since this is lazy loading, total count is not known
        rowsPerPage={pageSize}
        page={page - 1} // Adjust to 0-indexed for Material-UI
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangePageSize}
      />
    </TableContainer>
  );
}
