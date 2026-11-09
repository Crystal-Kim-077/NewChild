import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

/**
 * MyTable 컴포넌트 (마이페이지 공통 테이블)
 *
 * Props:
 * @param {array} columns - { key, label, render } 목록 [Required]
 * @param {array} rows - 행 데이터 [Required]
 * @param {function} getRowKey - 행 key 반환 함수 [Required]
 * @param {string} emptyText - 데이터가 없을 때 문구 [Optional, 기본값: 내역이 없습니다.]
 *
 * Example usage:
 * <MyTable columns={ columns } rows={ rows } getRowKey={ (row) => row.id } />
 */
function MyTable({ columns, rows, getRowKey, emptyText = '내역이 없습니다.' }) {
  const cellSx = { fontSize: '13pt', color: '#333', borderColor: 'secondary.main', py: 1.75, textAlign: 'center' };

  return (
    <Table sx={ { borderTop: '2px solid #333' } }>
      <TableHead>
        <TableRow sx={ { bgcolor: '#fafafa' } }>
          { columns.map((column) => <TableCell key={ column.key } sx={ { ...cellSx, fontWeight: 700 } }>{ column.label }</TableCell>) }
        </TableRow>
      </TableHead>
      <TableBody>
        { rows.length === 0 && (
          <TableRow><TableCell colSpan={ columns.length } sx={ { ...cellSx, py: 7, color: '#777' } }>{ emptyText }</TableCell></TableRow>
        ) }
        { rows.map((row) => (
          <TableRow key={ getRowKey(row) }>
            { columns.map((column) => (
              <TableCell key={ column.key } sx={ cellSx }>{ column.render ? column.render(row) : row[column.key] }</TableCell>
            )) }
          </TableRow>
        )) }
      </TableBody>
    </Table>
  );
}

export default MyTable;
