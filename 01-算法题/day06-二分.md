# Day 6 · 二分（7 题）

> 今日考点：**二分模板的两种写法**（左闭右开 / 闭区间）、**"二分答案"与"二分索引"的区别**、**有序性被破坏时如何判断哪半有效**（旋转数组）、**降维与利用矩阵性质**（74 vs 240）。

:::card 两个模板，选一个背死（面试时只用一个，别混）
**模板 A：左闭右开 `[l, r)`** —— 找"第一个满足条件的下标"（lower_bound 风格）
```cpp
int l = 0, r = n;                 // 答案范围 [0, n]
while (l < r) {
    int m = l + (r - l) / 2;
    if (ok(m)) r = m;             // m 满足 → 答案在左边（含 m）
    else       l = m + 1;
}
return l;                         // 可能等于 n（不存在）
```
**模板 B：闭区间 `[l, r]`** —— 找一个确定的元素（exact match）
```cpp
int l = 0, r = n - 1;
while (l <= r) {
    int m = l + (r - l) / 2;
    if (a[m] == target) return m;
    else if (a[m] < target) l = m + 1;
    else r = m - 1;
}
return -1;
```
> 你已有 `plan.md` 里写的是两个模板并存 —— 面试时**只用 A（求边界）或 B（查存在）中的一个**，混用是二分写挂的头号原因。
:::

| 题号 | 题目 | 难度 | 模板 | 复杂度 |
|---|---|---|---|---|
| 35 | 搜索插入位置 | Easy | A（lower_bound） | O(log n) |
| 74 | 搜索二维矩阵 | Medium | B（一维化） | O(log mn) |
| 34 | 首末位置 | Medium | A ×2 | O(log n) |
| 33 | 搜索旋转排序数组 | Medium | B（判有序半边） | O(log n) |
| 153 | 旋转数组最小值 | Medium | A（与右端点比） | O(log n) |
| 240 | 搜索二维矩阵 II | Medium | 非二分：右上角排除法 | O(m+n) |
| 4 | 两个正序数组的中位数 | Hard | A（在短数组上切分） | O(log min(m,n)) |

---

:::qa LC 35 · 搜索插入位置（Easy｜必刷）

**题目**
给定一个排序数组和一个目标值，在数组中找到目标值，并返回其索引。如果目标值不存在于数组中，返回它将会被按顺序插入的位置。
请必须使用时间复杂度为 `O(log n)` 的算法。

**示例 1**
```
输入：nums = [1,3,5,6], target = 5
输出：2
```

**示例 2**
```
输入：nums = [1,3,5,6], target = 2
输出：1
```

**示例 3**
```
输入：nums = [1,3,5,6], target = 7
输出：4
```

**示例 4**
```
输入：nums = [1,3,5,6], target = 0
输出：0
```

**约束**：`1 <= nums.length <= 10^4`；`-10^4 <= nums[i], target <= 10^4`；`nums` 为**无重复元素**的升序数组

**提示 1（方向）**
"插入位置"就是**第一个 `>= target` 的下标**（`lower_bound`）。注意答案可能是 `n`（target 比所有元素都大）。

**提示 2（关键不变量）**
用左闭右开 `[0, n)`：`l` 始终是"可能的答案"，`r` 是"上界外沿"。当 `nums[m] < target` 时 `m` 及其左边都不可能是答案 → `l = m + 1`；否则 `r = m`。循环结束时 `l == r` 就是答案。

**提示 3（伪代码）**
```
l = 0, r = n
while l < r:
    m = (l+r)/2
    if nums[m] < target: l = m+1
    else: r = m
return l
```

**完整代码**

```cpp
// LC 35 搜索插入位置
// 等价于 lower_bound：第一个 >= target 的下标
#include <vector>
using namespace std;

int searchInsert(vector<int>& nums, int target) {
    int l = 0, r = (int)nums.size();      // 左闭右开：答案可能是 n
    while (l < r) {
        int m = l + (r - l) / 2;
        if (nums[m] < target) l = m + 1;
        else                  r = m;      // nums[m] >= target，答案在 [l, m]
    }
    return l;
}
```

**复杂度**：时间 O(log n)，空间 O(1)。

**易错点**
- 写成闭区间 `r = n - 1` → target 比所有元素都大时返回 `n-1`（错，应为 `n`）。
- `m = (l + r) / 2` 在超大下标时溢出（本题不会，但养成 `l + (r-l)/2` 的习惯）。
- `r = m - 1`（左闭右开模板里不能减）。

**面试追问**
- 有重复元素时返回第一个还是最后一个？→ `lower_bound` 返回第一个 `>=`；`upper_bound` 返回第一个 `>`。
- 怎么改成 `upper_bound`？→ 把条件改成 `nums[m] <= target` 时 `l = m + 1`。
:::

:::qa LC 74 · 搜索二维矩阵（Medium｜必刷）

**题目**
给你一个满足下述两条属性的 `m x n` 整数矩阵：
1. 每行中的整数从左到右按**非严格递增**顺序排列；
2. 每行的第一个整数**大于**前一行的最后一个整数。

给你一个整数 `target`，如果 `target` 在矩阵中，返回 `true`，否则返回 `false`。

**示例 1**
```
输入：matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3
输出：true
```

**示例 2**
```
输入：matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 13
输出：false
```

**约束**：`1 <= m, n <= 100`；`-10^4 <= matrix[i][j], target <= 10^4`

**提示 1（方向）**
条件 2 意味着"下一行首 > 上一行尾"，所以**整个矩阵展平后是严格递增的一维数组** → 直接在一维上二分，把一维下标换算成二维坐标。

**提示 2（关键不变量）**
下标换算：`row = mid / n`，`col = mid % n`（`n` 是列数）。总长度 `m * n`，答案范围 `[0, m*n - 1]`。

**提示 3（伪代码）**
```
l = 0, r = m*n-1
while l <= r:
    mid = (l+r)/2
    v = mat[mid/n][mid%n]
    if v == target: return true
    if v < target: l = mid+1 else r = mid-1
```

**完整代码**

```cpp
// LC 74 搜索二维矩阵
// 整体有序 → 拉平成一维二分（下标换算 row = mid/n, col = mid%n）
#include <vector>
using namespace std;

bool searchMatrix(vector<vector<int>>& mat, int target) {
    int m = mat.size(), n = mat[0].size();
    int l = 0, r = m * n - 1;
    while (l <= r) {
        int mid = l + (r - l) / 2;
        int v = mat[mid / n][mid % n];      // 一维 → 二维
        if (v == target) return true;
        if (v < target) l = mid + 1;
        else            r = mid - 1;
    }
    return false;
}
```

**复杂度**：时间 O(log(mn))，空间 O(1)。

**易错点**
- 换算写反成 `mat[mid % m][mid / m]`（行数用错）。
- `m * n` 溢出（本题小，但大矩阵要用 `long long` 或直接二分两次）。
- 与 LC 240 混淆：**240 不满足"下一行首 > 上一行尾"，不能拉平二分**。

**面试追问**
- 如果只保证"每行有序 + 每列有序"（LC 240）？→ 用右上角排除法 O(m+n)，或对每行二分 O(m log n)。
- 两次二分（先找行再找列）怎么写？→ 先二分第一列找目标行，再在该行二分。
:::

:::qa LC 34 · 在排序数组中查找元素的第一个和最后一个位置（Medium｜必刷）

**题目**
给你一个按照**非递减**顺序排列的整数数组 `nums`，和一个目标值 `target`。请你找出给定目标值在数组中的**开始位置和结束位置**。
如果数组中不存在目标值 `target`，返回 `[-1, -1]`。
你必须设计并实现时间复杂度为 `O(log n)` 的算法解决此问题。

**示例 1**
```
输入：nums = [5,7,7,8,8,10], target = 8
输出：[3,4]
```

**示例 2**
```
输入：nums = [5,7,7,8,8,10], target = 6
输出：[-1,-1]
```

**示例 3**
```
输入：nums = [], target = 0
输出：[-1,-1]
```

**约束**：`0 <= nums.length <= 10^5`；`-10^9 <= nums[i], target <= 10^9`；`nums` 非递减

**提示 1（方向）**
两次二分：`lower_bound(target)` 得左端点；`lower_bound(target+1) - 1` 得右端点（即 `upper_bound - 1`）。

**提示 2（关键不变量）**
`lower_bound` 返回**第一个 `>= x` 的下标**。所以：
- 左端点 = `lower_bound(target)`，且必须校验 `left < n && nums[left] == target`（可能不存在）；
- 右端点 = `lower_bound(target + 1) - 1`。
注意 `target + 1` 在 `target == INT_MAX` 时会溢出 —— 面试时要提一句（或改用 `upper_bound` 判据 `nums[m] <= target`）。

**提示 3（伪代码）**
```
left = lowerBound(target)
if left == n or nums[left] != target: return [-1,-1]
right = lowerBound(target+1) - 1
return [left, right]
```

**完整代码**

```cpp
// LC 34 在排序数组中查找元素的第一个和最后一个位置
// 两次 lower_bound：左端点 + (第一个 > target 的位置 - 1)
#include <vector>
using namespace std;

// 第一个 >= t 的下标（返回值范围 [0, n]）
static int lowerBound(const vector<int>& a, long long t) {
    int l = 0, r = (int)a.size();
    while (l < r) {
        int m = l + (r - l) / 2;
        if (a[m] < t) l = m + 1;
        else          r = m;
    }
    return l;
}

vector<int> searchRange(vector<int>& nums, int target) {
    int n = nums.size();
    int left = lowerBound(nums, target);
    if (left == n || nums[left] != target) return {-1, -1};
    int right = lowerBound(nums, (long long)target + 1) - 1;
    return {left, right};
}
```

**复杂度**：时间 O(log n)，空间 O(1)。

**易错点**
- 忘记校验 `nums[left] == target` → 不存在的元素返回 `[left, left-1]` 之类的脏结果。
- `target + 1` 溢出 int（用 `long long` 形参解决）。
- 右端点写成 `lowerBound(target)` → 得到的是左端点。

**面试追问**
- 不用 `target+1` 怎么写 `upper_bound`？→ 条件改成 `a[m] <= t` 时 `l = m + 1`。
- 如果数组是严格递减的？→ 把比较方向整体反过来。
- 如果要统计出现次数？→ `right - left + 1`。
:::

:::qa LC 33 · 搜索旋转排序数组（Medium｜必刷）

**题目**
整数数组 `nums` 按升序排列，数组中的值**互不相同**。
在传递给函数之前，`nums` 在预先未知的某个下标 `k`（`0 <= k < nums.length`）上进行了**旋转**，使数组变为 `[nums[k], nums[k+1], ..., nums[n-1], nums[0], ..., nums[k-1]]`。
例如 `[0,1,2,4,5,6,7]` 在下标 3 处旋转后可能变为 `[4,5,6,7,0,1,2]`。
给你**旋转后**的数组 `nums` 和一个整数 `target`，如果 `nums` 中存在这个目标值，返回它的下标，否则返回 `-1`。
你必须设计一个时间复杂度为 `O(log n)` 的算法。

**示例 1**
```
输入：nums = [4,5,6,7,0,1,2], target = 0
输出：4
```

**示例 2**
```
输入：nums = [4,5,6,7,0,1,2], target = 3
输出：-1
```

**示例 3**
```
输入：nums = [1], target = 0
输出：-1
```

**约束**：`1 <= nums.length <= 5000`；`-10^4 <= nums[i], target <= 10^4`；元素**互不相同**

**提示 1（方向）**
旋转后数组不再全局有序，但**任意切一刀，至少有一半是有序的** —— 这是本题唯一的核心观察。
判断方法：若 `nums[l] <= nums[m]`，则左半 `[l, m]` 有序；否则右半 `[m, r]` 有序。

**提示 2（关键不变量）**
先判断哪半有序，再看 `target` 是否落在那个有序区间内：落在里面就把搜索范围收缩到该半，否则收缩到另一半。这样每轮都能丢掉一半，保持 O(log n)。

**提示 3（伪代码）**
```
while l <= r:
    m = (l+r)/2
    if a[m]==target: return m
    if a[l] <= a[m]:                      // 左半有序
        if a[l] <= target < a[m]: r = m-1
        else:                     l = m+1
    else:                                 // 右半有序
        if a[m] < target <= a[r]: l = m+1
        else:                     r = m-1
return -1
```

**完整代码**

```cpp
// LC 33 搜索旋转排序数组
// 二分的变体：每轮判断哪一半有序，再判断 target 是否在该半内
#include <vector>
using namespace std;

int search(vector<int>& a, int target) {
    int l = 0, r = (int)a.size() - 1;
    while (l <= r) {
        int m = l + (r - l) / 2;
        if (a[m] == target) return m;

        if (a[l] <= a[m]) {                              // 左半 [l, m] 有序
            if (a[l] <= target && target < a[m]) r = m - 1;
            else                                 l = m + 1;
        } else {                                         // 右半 [m, r] 有序
            if (a[m] < target && target <= a[r]) l = m + 1;
            else                                 r = m - 1;
        }
    }
    return -1;
}
```

**复杂度**：时间 O(log n)，空间 O(1)。

**易错点**
- 有序判断用 `a[l] < a[m]`：`l == m`（区间只剩一个元素）时判断会走错分支 → 必须用 `<=`。
- 区间包含关系写错（`target < a[m]` vs `target <= a[m]` 的等号归属，`a[m] == target` 已提前返回，所以这里用 `<` 更清晰）。
- 忘记 `nums` 可能没有旋转（`k = 0`）—— 上面的逻辑天然覆盖。

**面试追问**
- 有重复元素（LC 81）？→ 当 `a[l] == a[m] == a[r]` 时无法判断哪半有序，只能 `l++; r--;` 退化，最坏 O(n)。
- 找最小值（LC 153）？→ 下一题。
- 如果旋转了但允许找"最接近 target 的值"？→ 二分到底再比较左右邻居。
:::

:::qa LC 153 · 寻找旋转排序数组中的最小值（Medium｜必刷）

**题目**
已知一个长度为 `n` 的数组，预先按照升序排列，经由 `1` 到 `n` 次**旋转**后得到输入数组。
例如原数组 `nums = [0,1,2,4,5,6,7]`：旋转 4 次可得 `[4,5,6,7,0,1,2]`；旋转 7 次可得 `[0,1,2,4,5,6,7]`。
给你一个元素值**互不相同**的数组 `nums`，它原来是升序数组并进行了若干次旋转。请找出并返回数组中的**最小元素**。
你必须设计一个时间复杂度为 `O(log n)` 的算法。

**示例 1**
```
输入：nums = [3,4,5,1,2]
输出：1
```

**示例 2**
```
输入：nums = [4,5,6,7,0,1,2]
输出：0
```

**示例 3**
```
输入：nums = [11,13,15,17]
输出：11
解释：数组未旋转（或旋转了 n 次），最小值就是第一个元素
```

**约束**：`1 <= n <= 5000`；`-5000 <= nums[i] <= 5000`；元素**互不相同**

**提示 1（方向）**
与**右端点**比较：若 `nums[m] > nums[r]`，说明"下降点（最小值）"在 `m` 右边 → `l = m + 1`；否则最小值在 `[l, m]` 内 → `r = m`。
循环到 `l == r`，答案就是 `nums[l]`。

**提示 2（关键不变量）**
为什么和 `nums[r]` 比而不是 `nums[l]`？因为 `nums[l]` 可能本身就是最小值（未旋转时），无法区分"左半有序"还是"整体有序"；而 `nums[r]` 在旋转后一定落在"右段"的末尾，比较方向唯一。
注意 `r = m`（不能 `m - 1`），因为 `m` 本身可能是最小值。

**提示 3（伪代码）**
```
l=0, r=n-1
while l < r:
    m = (l+r)/2
    if a[m] > a[r]: l = m+1     // 最小值在右半
    else:           r = m       // 最小值在 [l, m]
return a[l]
```

**完整代码**

```cpp
// LC 153 寻找旋转排序数组中的最小值
// 与右端点比较：a[m] > a[r] 则拐点在右侧
#include <vector>
using namespace std;

int findMin(vector<int>& a) {
    int l = 0, r = (int)a.size() - 1;
    while (l < r) {
        int m = l + (r - l) / 2;
        if (a[m] > a[r]) l = m + 1;    // 右半存在更小值
        else             r = m;        // m 可能就是最小值
    }
    return a[l];
}
```

**复杂度**：时间 O(log n)，空间 O(1)。

**易错点**
- 写成 `r = m - 1` → 丢掉最小值本身。
- 与 `a[l]` 比较 → 未旋转的数组会进入错误分支（虽然某些写法治好，但更容易出错）。
- `while (l <= r)` → 会导致 `l` 越过 `r`，最后返回越界值。

**面试追问**
- 有重复元素（LC 154）？→ 当 `a[m] == a[r]` 时无法判断，`r--` 退化，最坏 O(n)。
- 如果要求**最大值**？→ 最小值的前一个位置（注意未旋转的情况）。
- 如果要找旋转点 `k`？→ 最小值下标就是 `k`。
:::

:::qa LC 240 · 搜索二维矩阵 II（Medium｜必刷）

**题目**
编写一个高效的算法来搜索 `m x n` 矩阵 `matrix` 中的一个目标值 `target`。该矩阵具有以下特性：
1. 每行的元素从左到右**升序**排列；
2. 每列的元素从上到下**升序**排列。

**示例 1**
```
输入：matrix = [[1,4,7,11,15],
               [2,5,8,12,19],
               [3,6,9,16,22],
               [10,13,14,17,24],
               [18,21,23,26,30]], target = 5
输出：true
```

**示例 2**
```
输入：matrix = [[1,4,7,11,15],
               [2,5,8,12,19],
               [3,6,9,16,22],
               [10,13,14,17,24],
               [18,21,23,26,30]], target = 20
输出：false
```

**约束**：`1 <= m, n <= 300`；`-10^9 <= matrix[i][j], target <= 10^9`

**提示 1（方向）**
注意这里**没有**"下一行首 > 上一行尾"，所以不能拉平二分。但可以**从右上角出发**：该位置是"本行最大 + 本列最小"，因此每次比较都能排除**一整行**或**一整列**。

**提示 2（关键不变量）**
设当前在 `(i, j)`：
- 若 `mat[i][j] > target`，则这一列下面的都更大 → `j--`（排除一列）；
- 若 `mat[i][j] < target`，则这一行左边的都更小 → `i++`（排除一行）。
最多走 `m + n` 步。

**提示 3（伪代码）**
```
i = 0, j = n-1
while i < m and j >= 0:
    v = mat[i][j]
    if v == target: return true
    if v > target: j--
    else:          i++
return false
```

**完整代码**

```cpp
// LC 240 搜索二维矩阵 II
// 右上角排除法：每步排除一行或一列，O(m+n)
#include <vector>
using namespace std;

bool searchMatrix(vector<vector<int>>& mat, int target) {
    int m = mat.size(), n = mat[0].size();
    int i = 0, j = n - 1;                 // 从右上角开始
    while (i < m && j >= 0) {
        int v = mat[i][j];
        if (v == target) return true;
        if (v > target) j--;              // 该列下方都 >= v，整列排除
        else            i++;              // 该行左方都 <= v，整行排除
    }
    return false;
}
```

**复杂度**：时间 O(m+n)，空间 O(1)。

**易错点**
- 从**左上角**出发 → 两个方向都变大，无法排除。
- 边界写成 `i <= m` 或 `j > 0` → 越界或漏元素。
- 与 LC 74 混淆（74 可以拉平二分，速度更快 O(log mn)）。

**面试追问**
- 与 74 的本质区别？→ 74 有跨行全局有序，240 只有行列局部有序。
- 如果想要比 O(m+n) 更快？→ 对每行二分 O(m log n)，当 `m` 很小 `n` 很大时更优；没有更强的通用下界。
- 如果矩阵稀疏/超大放不下内存？→ 分块 + 索引，或转成按行存储的外部查找。
:::

:::qa LC 4 · 寻找两个正序数组的中位数（Hard｜必刷）

**题目**
给定两个大小分别为 `m` 和 `n` 的正序（从小到大）数组 `nums1` 和 `nums2`。请你找出并返回这两个正序数组的**中位数**。
算法的时间复杂度应该为 `O(log (m+n))`。

**示例 1**
```
输入：nums1 = [1,3], nums2 = [2]
输出：2.00000
解释：合并数组 = [1,2,3]，中位数 2
```

**示例 2**
```
输入：nums1 = [1,2], nums2 = [3,4]
输出：2.50000
解释：合并数组 = [1,2,3,4]，中位数 (2 + 3) / 2 = 2.5
```

**约束**：`0 <= m, n <= 1000`；`1 <= m + n <= 2000`；`-10^6 <= nums1[i], nums2[i] <= 10^6`

**提示 1（方向）**
中位数的本质是：把合并后的数组切成**左右两半**，左半元素个数固定为 `half = (m+n+1)/2`，且满足 `左半最大 <= 右半最小`。
于是问题变成：**在较短的数组上二分"切几刀"**。

**提示 2（关键不变量）**
设 `A` 短、`B` 长，在 `A` 上取切分点 `i`（左半含 `A[0..i-1]`），则 `j = half - i`。
合法条件：`aL <= bR && bL <= aR`，其中 `aL = A[i-1]（或 -∞）`、`aR = A[i]（或 +∞）`，`B` 同理。
不合法时只需移动一侧：`aL > bR` → `A` 左半太大 → `r = i - 1`；否则 `l = i + 1`。

**提示 3（伪代码）**
```
保证 A 更短
half = (m+n+1)/2
l = 0, r = m
while l <= r:
    i = (l+r)/2; j = half - i
    aL,aR,bL,bR = 边界值
    if aL <= bR and bL <= aR:
        if 总长为奇数: return max(aL,bL)
        return (max(aL,bL)+min(aR,bR))/2.0
    elif aL > bR: r = i-1
    else:         l = i+1
```

**完整代码**

```cpp
// LC 4 寻找两个正序数组的中位数
// 在较短数组上二分切分点：i + j = (m+n+1)/2 且 aL<=bR && bL<=aR
#include <vector>
#include <climits>
#include <algorithm>
using namespace std;

double findMedianSortedArrays(vector<int>& A, vector<int>& B) {
    if (A.size() > B.size()) return findMedianSortedArrays(B, A);   // 保证 A 更短

    int m = A.size(), n = B.size();
    int half = (m + n + 1) / 2;        // 左半应有的元素个数（向上取整）
    int l = 0, r = m;                  // 在 A 上二分切分点 i in [0, m]

    while (l <= r) {
        int i = l + (r - l) / 2;       // A 的左半取 A[0..i-1]
        int j = half - i;              // B 的左半取 B[0..j-1]

        int aL = (i == 0) ? INT_MIN : A[i - 1];
        int aR = (i == m) ? INT_MAX : A[i];
        int bL = (j == 0) ? INT_MIN : B[j - 1];
        int bR = (j == n) ? INT_MAX : B[j];

        if (aL <= bR && bL <= aR) {    // 找到合法切分
            if ((m + n) % 2 == 1) return max(aL, bL);
            return (max(aL, bL) + min(aR, bR)) / 2.0;
        } else if (aL > bR) {
            r = i - 1;                 // A 左半太大 → 切分点左移
        } else {
            l = i + 1;                 // B 左半太大 → 切分点右移
        }
    }
    return 0.0;
}
```

**复杂度**：时间 O(log min(m,n))，空间 O(1)。

**易错点**
- 忘记"保证 A 更短" → `j = half - i` 可能越界为负。
- 边界用 `INT_MIN/INT_MAX` 但类型搞错（`double` 场景下用 `-1e18` 也可，但整型比较用 `INT_MIN/MAX` 更清晰）。
- `/ 2` 写成整数除法 → 丢小数（必须 `/ 2.0`）。
- `half` 忘记向上取整（奇数长度时左半多一个）。

**面试追问**
- 先说 O(m+n) 的归并双指针解法会加分吗？→ 会，作为"朴素解 → 优化解"的过渡，但要明确说明复杂度不达标。
- 为什么在**较短**数组上二分？→ 保证 `j` 始终在 `[0, n]` 内，省掉大量边界判断。
- 如果改成"找第 k 小"（两个有序数组）？→ 同一套切分思路，或用"每次排除 k/2 个元素"的经典解法。
:::

---

## 今日复盘三问

1. 二分的两个模板分别解决什么问题？为什么混用容易出错？
2. 旋转数组题（33、153）的共同观察是什么？（**每轮至少有一半是有序的**）
3. 74 和 240 的区别在哪？为什么 240 不能二分到 O(log)？
