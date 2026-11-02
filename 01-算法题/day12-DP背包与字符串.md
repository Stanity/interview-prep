# Day 12 · DP II（背包 / 字符串 / 区间）（8 题）

> 今日考点：**0-1 背包 vs 完全背包的遍历顺序**、**子集和/计数问题**、**二维网格路径**、**区间 DP（回文）**、**双序列 DP（LCS / 编辑距离）**。

:::card 背包三兄弟 —— 遍历顺序决定一切（面试最容易被问倒的一张表）
| 类型 | 外层 | 内层 | 记忆点 |
|---|---|---|---|
| **0-1 背包**（每件只能用一次） | 物品 | 容量**倒序** | 倒序保证"取当前物品时用的是上一件物品的状态" |
| **完全背包**（物品无限） | 物品 | 容量**正序** | 正序允许"同一物品重复取" |
| **求组合数**（顺序无关） | **物品** | 容量正序 | 每种组合只统计一次 |
| **求排列数**（顺序有关） | **容量** | 物品 | 顺序不同算不同方案 |

```cpp
// 0-1 背包：能否/多少（416 分割等和子集、494 目标和）
for (int x : nums)
    for (int j = target; j >= x; j--)      // 倒序
        dp[j] = dp[j] || dp[j - x];

// 完全背包：最少物品数（322/279）
for (int c : coins)
    for (int j = c; j <= amount; j++)      // 正序
        dp[j] = min(dp[j], dp[j - c] + 1);

// 组合数（518 零钱兑换 II）：外层物品、内层容量
for (int c : coins)
    for (int j = c; j <= amount; j++)
        dp[j] += dp[j - c];                // → [1,2] 和 [2,1] 只算一次

// 排列数（377 组合总和 IV）：外层容量、内层物品
for (int j = 1; j <= target; j++)
    for (int c : nums) if (j >= c)
        dp[j] += dp[j - c];                // → [1,2] 和 [2,1] 分别计数
```
:::

:::card 二维 DP 的三个依赖方向（决定遍历顺序）
| 依赖方向 | 遍历顺序 | 典型题 |
|---|---|---|
| 上 / 左 | 从上到下、从左到右 | 62 路径、64 最小路径和 |
| 左上（i-1, j-1） | 从上到下、从左到右 | 1143 LCS、72 编辑距离 |
| 区间 (i+1, j-1) | **i 从后往前**、j 从 i 往后 | 5 回文、32 最长有效括号 |
:::

| 题号 | 题目 | 难度 | 模型 |
|---|---|---|---|
| 416 | 分割等和子集 | Medium | 0-1 背包（可行性） |
| 62 | 不同路径 | Medium | 二维路径计数 |
| 64 | 最小路径和 | Medium | 二维路径最优化 |
| 5 | 最长回文子串 | Medium | 中心扩展 / 区间 DP |
| 1143 | 最长公共子序列 | Medium | 双序列 DP |
| 72 | 编辑距离 | Medium | 双序列 DP（三操作） |
| 32 | 最长有效括号 | Hard | 栈 / 区间 DP |
| 494 | 目标和 | Medium | 0-1 背包（计数） |

---

:::qa LC 416 · 分割等和子集（Medium｜必刷）

**题目**
给你一个**只包含正整数**的**非空**数组 `nums`。请你判断是否可以将这个数组分割成两个子集，使得两个子集的**元素和相等**。

**示例 1**
```
输入：nums = [1,5,11,5]
输出：true
解释：数组可以分割成 [1,5,5] 和 [11]
```

**示例 2**
```
输入：nums = [1,2,3,5]
输出：false
解释：数组不能分割成两个元素和相等的子集
```

**约束**：`1 <= nums.length <= 200`；`1 <= nums[i] <= 100`

**提示 1（方向）**
总和为奇数直接 `false`；否则问题变成"能否从数组里选出若干个数，和恰好为 `total/2`" → **0-1 背包（可行性）**。

**提示 2（关键不变量）**
`dp[j]` 表示"能否凑出和为 j"。内层**倒序**遍历容量，保证每个数只用一次。

**提示 3（伪代码）**
```
sum 为奇数 → false
target = sum/2; dp[0] = true
for x in nums:
    for j in target..x (倒序): dp[j] = dp[j] or dp[j-x]
return dp[target]
```

**完整代码**

```cpp
// LC 416 分割等和子集
#include <vector>
#include <numeric>
using namespace std;

bool canPartition(vector<int>& nums) {
    int sum = 0;
    for (int x : nums) sum += x;
    if (sum % 2) return false;                 // 和为奇数不可能平分
    int target = sum / 2;

    vector<bool> dp(target + 1, false);
    dp[0] = true;                              // 和为 0 总能凑出（空集）
    for (int x : nums)
        for (int j = target; j >= x; j--)       // 倒序：每个数只用一次
            dp[j] = dp[j] || dp[j - x];

    return dp[target];
}
```

**复杂度**：时间 O(n · target)，空间 O(target)。

**易错点**
- 内层**正序** → 变成"每个数可重复用"，答案可能错（如 `[1,2,3,5]` 会误判 true）。
- 忘记判奇数。
- `dp[0] = false` → 全错。

**面试追问**
- 如果要求返回**具体两组**？→ 记录选择路径反向还原。
- 数据规模到 `n = 1000, sum = 10^6` 时怎么办？→ `bitset` 位运算优化（`dp |= dp << x`），常数快 64 倍。
- 和 494 的关系？→ 494 求的是**方案数**，这里是**可行性**。
:::

:::qa LC 62 · 不同路径（Medium｜必刷）

**题目**
一个机器人位于一个 `m x n` 网格的左上角。机器人每次只能**向下**或者**向右**移动一步。机器人试图达到网格的右下角。
问总共有多少条**不同的路径**？

**示例 1**
```
输入：m = 3, n = 7
输出：28
```

**示例 2**
```
输入：m = 3, n = 2
输出：3
```

**约束**：`1 <= m, n <= 100`

**提示 1（方向）**
到达 `(i, j)` 只能来自**上面**或**左边** → `dp[i][j] = dp[i-1][j] + dp[i][j-1]`。第一行/第一列都是 1。

**提示 2（关键不变量）**
一维滚动：`dp[j] += dp[j-1]`（此时 `dp[j]` 还是上一行的值 = 从上来，`dp[j-1]` 已是本行的值 = 从左来）。

**提示 3（伪代码）**
```
dp[0..n-1] = 1
for i in 1..m-1:
    for j in 1..n-1: dp[j] += dp[j-1]
return dp[n-1]
```

**完整代码**

```cpp
// LC 62 不同路径（一维滚动）
#include <vector>
using namespace std;

int uniquePaths(int m, int n) {
    vector<int> dp(n, 1);                  // 第一行全是 1
    for (int i = 1; i < m; i++)
        for (int j = 1; j < n; j++)
            dp[j] += dp[j - 1];            // 上（旧 dp[j]）+ 左（新 dp[j-1]）
    return dp[n - 1];
}
```

**复杂度**：时间 O(mn)，空间 O(n)。

**易错点**
- `dp` 初始化成 0 → 第一行/第一列错。
- 内层从 0 开始 → `dp[j-1]` 越界。
- 二维版忘记初始化第一行/第一列。

**面试追问**
- 数学解法？→ 从 `(0,0)` 到 `(m-1, n-1)` 共走 `m+n-2` 步，选 `m-1` 步向下 → `C(m+n-2, m-1)`。
- 有障碍物（LC 63）？→ 障碍格 `dp = 0`（且第一行/列遇到障碍后全为 0）。
- 如果可以有 3 种走法（加"斜着走"）？→ 转移加上 `dp[i-1][j-1]`。
:::

:::qa LC 64 · 最小路径和（Medium｜必刷）

**题目**
给定一个包含非负整数的 `m x n` 网格 `grid`，请找出一条从**左上角**到**右下角**的路径，使得路径上的数字总和为**最小**。
说明：每次只能**向下**或者**向右**移动一步。

**示例 1**
```
输入：grid = [[1,3,1],
              [1,5,1],
              [4,2,1]]
输出：7
解释：路径 1→3→1→1→1 的总和最小
```

**示例 2**
```
输入：grid = [[1,2,3],
              [4,5,6]]
输出：12
```

**约束**：`1 <= m, n <= 200`；`0 <= grid[i][j] <= 200`

**提示 1（方向）**
与 62 同构，只是把"计数"换成"求最小"：`dp[i][j] = grid[i][j] + min(上, 左)`。

**提示 2（关键不变量）**
可以直接**原地修改 `grid`** 省掉额外数组（面试时说明"我修改了输入，若不允许就另开 dp"）。第一行只能从左边来，第一列只能从上来。

**提示 3（伪代码）**
```
for i, j:
    if (0,0): continue
    if i == 0:  grid[i][j] += grid[i][j-1]
    elif j == 0: grid[i][j] += grid[i-1][j]
    else:        grid[i][j] += min(grid[i-1][j], grid[i][j-1])
return grid[m-1][n-1]
```

**完整代码**

```cpp
// LC 64 最小路径和（原地修改）
#include <vector>
#include <algorithm>
using namespace std;

int minPathSum(vector<vector<int>>& g) {
    int m = g.size(), n = g[0].size();
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (i == 0 && j == 0) continue;
            else if (i == 0) g[i][j] += g[i][j - 1];      // 只能从左边来
            else if (j == 0) g[i][j] += g[i - 1][j];      // 只能从上面来
            else g[i][j] += min(g[i - 1][j], g[i][j - 1]);
        }
    }
    return g[m - 1][n - 1];
}
```

**复杂度**：时间 O(mn)，空间 O(1)（原地）。

**易错点**
- 忘记处理第一行/第一列 → 越界或走错。
- `i == 0 && j == 0` 没跳过 → 起点被加两次。
- 原地修改前未向面试官说明（有些题不允许改输入）。

**面试追问**
- 一维滚动怎么写？→ `dp[j] = grid[i][j] + min(dp[j]（上）, dp[j-1]（左）)`，需先处理 `j=0`。
- 要返回**路径本身**？→ 记录决策或从终点反向贪心回退。
- 如果允许上下左右都走（不限制方向）？→ 变成最短路问题（Dijkstra）。
:::

:::qa LC 5 · 最长回文子串（Medium｜必刷）

**题目**
给你一个字符串 `s`，找到 `s` 中最长的**回文子串**。

**示例 1**
```
输入：s = "babad"
输出："bab"
解释："aba" 同样是符合题意的答案
```

**示例 2**
```
输入：s = "cbbd"
输出："bb"
```

**约束**：`1 <= s.length <= 1000`；`s` 仅由数字和英文字母组成

**提示 1（方向）**
三种写法：① 暴力枚举 O(n³)；② **中心扩展** O(n²)/O(1)，最好写；③ 区间 DP / Manacher。

**提示 2（关键不变量）**
中心扩展：回文中心有 `2n-1` 个（n 个单字符中心 + n-1 个双字符中心）。对每个中心向两边扩，记录最长。
DP 版：`pal[i][j] = (s[i]==s[j]) && (j-i <= 2 || pal[i+1][j-1])`，**i 必须从后往前遍历**（依赖 `i+1`）。

**提示 3（伪代码 · 中心扩展）**
```
for c in 0..n-1:
    for k in {0, 1}:            // 奇数中心 / 偶数中心
        l = c, r = c + k
        while l >= 0 and r < n and s[l]==s[r]: l--, r++
        len = r - l - 1
        更新最长
```

**完整代码（中心扩展，推荐）**

```cpp
// LC 5 最长回文子串（中心扩展）
#include <string>
using namespace std;

string longestPalindrome(string s) {
    int n = s.size(), start = 0, maxLen = 1;
    for (int c = 0; c < n; c++) {
        for (int k = 0; k <= 1; k++) {              // 0: 奇数长度, 1: 偶数长度
            int l = c, r = c + k;
            while (l >= 0 && r < n && s[l] == s[r]) { l--; r++; }
            int len = r - l - 1;                     // 回退到合法边界外，长度是 r-l-1
            if (len > maxLen) { maxLen = len; start = l + 1; }
        }
    }
    return s.substr(start, maxLen);
}
```

**完整代码（区间 DP）**

```cpp
// LC 5 最长回文子串（区间 DP）
string longestPalindrome(string s) {
    int n = s.size(), start = 0, maxLen = 1;
    vector<vector<bool>> pal(n, vector<bool>(n, false));
    for (int i = n - 1; i >= 0; i--)                 // i 从后往前
        for (int j = i; j < n; j++) {
            pal[i][j] = (s[i] == s[j]) && (j - i <= 2 || pal[i + 1][j - 1]);
            if (pal[i][j] && j - i + 1 > maxLen) { maxLen = j - i + 1; start = i; }
        }
    return s.substr(start, maxLen);
}
```

**复杂度**：中心扩展 O(n²)/O(1)；DP O(n²)/O(n²)。

**易错点**
- 中心扩展的长度公式 `r - l - 1`（因为 while 结束时 `l` 和 `r` 已经越界）。
- DP 版 `i` 从前往后遍历 → `pal[i+1][j-1]` 还没算。
- 偶数中心漏掉（`k` 只取 0）。
- 忘记 `start = l + 1`（不是 `l`）。

**面试追问**
- Manacher 算法？→ O(n)，思路是"利用已知回文的对称性减少扩展"，面试很少要求手写，但要知道。
- 求**回文子串的个数**（LC 647）？→ 同样的中心扩展，每次成功匹配就计数。
- 求**最长回文子序列**（LC 516）？→ 那是双序列 DP（`s` 与 `reverse(s)` 的 LCS）。
:::

:::qa LC 1143 · 最长公共子序列（Medium｜必刷）

**题目**
给定两个字符串 `text1` 和 `text2`，返回这两个字符串的**最长公共子序列的长度**。如果不存在公共子序列，返回 `0`。
> **子序列**：不改变字符相对顺序、删除某些字符后得到的新字符串。例如 `"ace"` 是 `"abcde"` 的子序列，但 `"aec"` 不是。

**示例 1**
```
输入：text1 = "abcde", text2 = "ace"
输出：3
解释：最长公共子序列是 "ace"，长度 3
```

**示例 2**
```
输入：text1 = "abc", text2 = "abc"
输出：3
```

**示例 3**
```
输入：text1 = "abc", text2 = "def"
输出：0
```

**约束**：`1 <= text1.length, text2.length <= 1000`；仅含小写英文字符

**提示 1（方向）**
双序列 DP 的标准形态：`dp[i][j]` = `text1` 前 `i` 个字符与 `text2` 前 `j` 个字符的 LCS 长度。

**提示 2（关键不变量）**
- 若 `text1[i-1] == text2[j-1]`：`dp[i][j] = dp[i-1][j-1] + 1`
- 否则：`dp[i][j] = max(dp[i-1][j], dp[i][j-1])`
遍历顺序：从上到下、从左到右（依赖左上/上/左）。

**提示 3（伪代码）**
```
for i in 1..m:
    for j in 1..n:
        dp[i][j] = a[i-1]==b[j-1] ? dp[i-1][j-1]+1 : max(dp[i-1][j], dp[i][j-1])
```

**完整代码**

```cpp
// LC 1143 最长公共子序列
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

int longestCommonSubsequence(string a, string b) {
    int m = a.size(), n = b.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));

    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = (a[i - 1] == b[j - 1])
                     ? dp[i - 1][j - 1] + 1
                     : max(dp[i - 1][j], dp[i][j - 1]);
    return dp[m][n];
}
```

**复杂度**：时间 O(mn)，空间 O(mn)（可滚动到 O(n)）。

**易错点**
- 下标错位（`dp[i][j]` 对应 `a[i-1]`、`b[j-1]`）。
- 不相等时只取 `dp[i-1][j]` → 漏掉另一种情况。
- 滚动数组优化时内层必须**倒序**（因为依赖 `dp[i-1][j-1]`），并单独保存左上角的值。

**面试追问**
- 空间怎么优化？→ 两个一维数组（上一行 + 当前行），或一行 + 临时变量保存 `dp[i-1][j-1]`。
- 求**最长公共子串**（连续）？→ 不相等时 `dp[i][j] = 0`，取全局最大。
- 与编辑距离的关系？→ 编辑距离在"不相等"时有三种选择，LCS 只有两种。
:::

:::qa LC 72 · 编辑距离（Medium｜必刷）

**题目**
给你两个单词 `word1` 和 `word2`，请返回将 `word1` 转换成 `word2` 所使用的**最少操作数**。
你可以对一个单词进行如下三种操作：
- 插入一个字符
- 删除一个字符
- 替换一个字符

**示例 1**
```
输入：word1 = "horse", word2 = "ros"
输出：3
解释：
horse → rorse（替换 h→r）
rorse → rose（删除 r）
rose → ros（删除 e）
```

**示例 2**
```
输入：word1 = "intention", word2 = "execution"
输出：5
解释：intention → inention（删 t）→ enention（替 i→e）→ exention（替 n→x）→ exection（替 n→c）→ execution（插 u）
```

**约束**：`0 <= word1.length, word2.length <= 500`

**提示 1（方向）**
`dp[i][j]` = 把 `word1` 前 `i` 个字符变成 `word2` 前 `j` 个字符的最少操作数。

**提示 2（关键不变量）**
- 相同：`dp[i][j] = dp[i-1][j-1]`
- 不同：`1 + min(替换 dp[i-1][j-1], 删除 dp[i-1][j], 插入 dp[i][j-1])`
初始化：`dp[i][0] = i`（全删）、`dp[0][j] = j`（全插）。

**提示 3（伪代码）**
```
dp[i][0]=i; dp[0][j]=j
for i,j:
    if a[i-1]==b[j-1]: dp[i][j] = dp[i-1][j-1]
    else: dp[i][j] = 1 + min({dp[i-1][j-1], dp[i-1][j], dp[i][j-1]})
```

**完整代码**

```cpp
// LC 72 编辑距离
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

int minDistance(string a, string b) {
    int m = a.size(), n = b.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));

    for (int i = 0; i <= m; i++) dp[i][0] = i;      // 删除 i 次
    for (int j = 0; j <= n; j++) dp[0][j] = j;      // 插入 j 次

    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++) {
            if (a[i - 1] == b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
            else dp[i][j] = 1 + min({dp[i - 1][j - 1],   // 替换
                                     dp[i - 1][j],       // 删除 a[i-1]
                                     dp[i][j - 1]});     // 插入 b[j-1]
        }
    return dp[m][n];
}
```

**复杂度**：时间 O(mn)，空间 O(mn)。

**易错点**
- 初始化漏掉 `dp[0][j]` / `dp[i][0]`。
- 三个候选的语义说反（`dp[i-1][j]` 是删除、`dp[i][j-1]` 是插入）。
- 空串情况（`m=0` 或 `n=0`）没被初始化覆盖。

**面试追问**
- 三种操作的**语义**分别对应哪个方向？（见代码注释，面试官经常让你解释）
- 只允许插入和删除（不允许替换）？→ 只保留两种转移，结果等于 `m + n - 2·LCS`。
- 要输出**具体操作序列**？→ 从 `dp[m][n]` 反向回溯每一步的选择。
:::

:::qa LC 32 · 最长有效括号（Hard｜必刷）

**题目**
给你一个只包含 `'('` 和 `')'` 的字符串，找出**最长有效（格式正确且连续）括号子串**的长度。

**示例 1**
```
输入：s = "(()"
输出：2
解释：最长有效括号子串是 "()"
```

**示例 2**
```
输入：s = ")()())"
输出：4
解释：最长有效括号子串是 "()()"
```

**示例 3**
```
输入：s = ""
输出：0
```

**约束**：`0 <= s.length <= 3 * 10^4`；`s[i]` 为 `'('` 或 `')'`

**提示 1（方向）**
最优解是**栈 + 哨兵**：栈底始终保存"最后一个未匹配位置的下标"，初始为 `-1`。

**提示 2（关键不变量）**
- 遇 `'('`：压入下标。
- 遇 `')'`：先弹栈；若栈空说明这个右括号多余 → 把它当作新的哨兵压入；否则当前有效长度 = `i - 栈顶`。
这样每次都能直接得到"以 i 结尾的最长有效长度"。

**提示 3（伪代码）**
```
st = [-1]; best = 0
for i, ch in s:
    if ch == '(': st.push(i)
    else:
        st.pop()
        if st 空: st.push(i)          // 多余右括号 → 新哨兵
        else: best = max(best, i - st.top())
```

**完整代码（栈）**

```cpp
// LC 32 最长有效括号（栈 + 哨兵）
#include <string>
#include <stack>
#include <algorithm>
using namespace std;

int longestValidParentheses(string s) {
    stack<int> st;
    st.push(-1);                          // 哨兵：最后一个未匹配位置
    int best = 0;
    for (int i = 0; i < (int)s.size(); i++) {
        if (s[i] == '(') {
            st.push(i);
        } else {
            st.pop();
            if (st.empty()) st.push(i);   // 多余的右括号，作为新的哨兵
            else best = max(best, i - st.top());
        }
    }
    return best;
}
```

**完整代码（DP）**

```cpp
// LC 32 DP：dp[i] = 以 i 结尾的最长有效括号长度
int longestValidParentheses(string s) {
    int n = s.size(), best = 0;
    vector<int> dp(n, 0);
    for (int i = 1; i < n; i++) {
        if (s[i] != ')') continue;
        if (s[i - 1] == '(') {
            dp[i] = (i >= 2 ? dp[i - 2] : 0) + 2;
        } else {
            int j = i - dp[i - 1] - 1;                 // 跳到这段有效串的前一个字符
            if (j >= 0 && s[j] == '(')
                dp[i] = dp[i - 1] + 2 + (j >= 1 ? dp[j - 1] : 0);
        }
        best = max(best, dp[i]);
    }
    return best;
}
```

**复杂度**：栈 O(n)/O(n)；DP O(n)/O(n)。

**易错点**
- 栈底不放 `-1` → 无法计算长度。
- 弹栈后栈空时忘记压入当前下标（作为新哨兵）→ 后续长度算错。
- DP 版 `j` 的计算和边界判断容易错。

**面试追问**
- 还有 O(1) 空间的双计数器法？→ 左到右扫一遍（`left == right` 时更新，`right > left` 时清零），右到左再扫一遍处理多余左括号。
- 为什么需要反向再扫一次？→ 正向只能捕捉"右括号过多"的情况。
- 与 LC 20（判断有效）的关系？→ 20 只判断整体是否有效，本题求最长连续有效**子串**。
:::

:::qa LC 494 · 目标和（Medium｜必刷）

**题目**
给你一个整数数组 `nums` 和一个整数 `target`。
向数组中的每个整数前添加 `'+'` 或 `'-'`，然后串联起所有整数，可以构造一个**表达式**。
例如 `nums = [2, 1]`，可以在 2 之前添加 `'+'`、在 1 之前添加 `'-'`，然后串联起来得到表达式 `"+2-1"`。
返回可以通过上述方法构造的、运算结果等于 `target` 的**不同表达式的数目**。

**示例 1**
```
输入：nums = [1,1,1,1,1], target = 3
输出：5
解释：一共有 5 种方法让最终目标和为 3
-1+1+1+1+1 = 3
+1-1+1+1+1 = 3
+1+1-1+1+1 = 3
+1+1+1-1+1 = 3
+1+1+1+1-1 = 3
```

**示例 2**
```
输入：nums = [1], target = 1
输出：1
```

**约束**：`1 <= nums.length <= 20`；`0 <= nums[i] <= 1000`；`-1000 <= target <= 1000`

**提示 1（方向）**
设取正号的元素和为 `P`，取负号的元素和为 `N`，则 `P - N = target` 且 `P + N = total` → **`P = (total + target) / 2`**。
于是问题变成"从数组里选若干个元素，和恰好为 `P` 的**方案数**" → **0-1 背包计数**。

**提示 2（关键不变量）**
`dp[j] += dp[j - x]`（内层**倒序**）。`dp[0] = 1`（什么都不选的空方案）。
前置校验：`total < abs(target)` 或 `(total + target)` 为奇数 → 返回 0。

**提示 3（伪代码）**
```
total = sum(nums)
if total < |target| or (total + target) % 2: return 0
P = (total + target) / 2
dp[0] = 1
for x in nums:
    for j in P..x (倒序): dp[j] += dp[j-x]
return dp[P]
```

**完整代码**

```cpp
// LC 494 目标和 → 转化为 0-1 背包计数
#include <vector>
#include <cstdlib>
using namespace std;

int findTargetSumWays(vector<int>& nums, int target) {
    int total = 0;
    for (int x : nums) total += x;

    // 取正号的和 P 必须是非负整数
    if (total < abs(target)) return 0;
    if ((total + target) % 2 != 0) return 0;

    int P = (total + target) / 2;
    vector<int> dp(P + 1, 0);
    dp[0] = 1;                              // 空集算一种方案

    for (int x : nums)
        for (int j = P; j >= x; j--)         // 倒序：0-1 背包
            dp[j] += dp[j - x];

    return dp[P];
}
```

**复杂度**：时间 O(n · P)，空间 O(P)。（另一条路：记忆化 DFS，O(n · total)）

**易错点**
- `(total + target) % 2` 在 `total + target < 0` 时 C++ 结果是**负**的（`-1 % 2 == -1`）→ 必须先判 `total < abs(target)`。
- 内层正序 → 变成完全背包，方案数爆炸。
- `dp[0] = 0` → 全 0。

**面试追问**
- 直接记忆化 DFS 怎么写？→ `dfs(i, remain)`，`remain` 可能为负要偏移，或用 `map` 缓存。
- 为什么背包法比 DFS 快？→ 把"指数枚举"变成"按和的维度聚合"，`O(n · sum)`。
- 如果 `nums[i]` 可以是 0？→ 每个 0 都会让方案数翻倍（背包法天然处理）。
:::

---

## 今日复盘四问

1. 0-1 背包和完全背包的代码差别只有一处，是哪一处？为什么？（内层倒序/正序）
2. 求"组合数"和求"排列数"时，内外层循环怎么放？
3. 62 和 64 的转移只差一个 `min`/`+`，它们的共同依赖方向是什么？
4. 编辑距离的三个候选分别对应什么操作？（`dp[i-1][j-1]` 替换、`dp[i-1][j]` 删除、`dp[i][j-1]` 插入）
