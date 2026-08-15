// ============================================================
// 고객 수정 화면
// 흐름:
//   1) URL 의 :id 읽기
//   2) GET 으로 기존 데이터 → 폼 state 채우기
//   3) 사용자가 수정 → PUT → 목록 이동
// ============================================================

import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  getCustomer,
  updateCustomer,
} from '../api/customerApi.ts';
import type { CustomerRequest } from '../types/customer.ts';

function CustomerEdit() {
  // URL: /customers/3/edit → id = "3"
  const { id } = useParams();
  const navigate = useNavigate();

  // 문자열 id -> 숫자, 이상하면 NaN
  const customerId = Number(id);

  // 폼 필드 (여기부터 다시 작업 매뉴얼 10-1)

}

export default CustomerEdit;