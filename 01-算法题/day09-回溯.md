# Day 9 · 回溯（8 题）

> 今日考点：**回溯模板**（路径 / 选择列表 / 结束条件）、**两种去重**（`start` 索引 vs `used` 数组）、**剪枝三问**。

:::card 回溯模板（所有回溯题都是它的变体）
```cpp
void dfs(参数) {
    if (满足结束条件) { res.push_back(path); return; }
    for (选择 : 当前选择列表) {
        if (不合法/被剪枝) continue;
        path.push_back(选择);      // 做选择
        标记状态;
        dfs(下一层);
        撤销标记;                  // 回溯
        path.pop_back();           // 撤销选择
    }
}
```
:::

:::card 剪枝三问（面试必问"怎么优化"，三句话答完）
**① 用 `start` 还是 `used`？**
- 组合 / 子集 / 分割：元素**顺序不重要** → 用 `start` 索引，保证"只往后选"，天然不重复
- 排列：元素**顺序重要** → 用 `used[]` 标记"哪些已经被选过"

**② 同一层去重 vs 同一枝去重？**
- **同一层去重**（组合里有重复元素，如 LC 40、LC 90）：先 `sort`，然后 `if (i > start && a[i] == a[i-1]) continue;`
- **同一枝去重**（排列里有重复元素，如 LC 47）：`sort` + `if (i > 0 && a[i] == a[i-1] && !used[i-1]) continue;`
- 记法：`used[i-1] == false` 表示"同层的上一个相同元素已经撤销了"，所以要跳过。

**③ 能剪什么？**
- 排序后 `if (a[i] > remain) break;`（组合总和）
- 剩余元素不够凑满时 `break`（如 LC 77 组合）
- 合法性前置判断（括号生成：`right < left` 才能放右括号；N 皇后：列/对角线占用表）
:::

| 题号 | 题目 | 难度 | 选择列表 | 去重方式 |
|---|---|---|---|---|
| 46 | 全排列 | Medium | 所有未用元素 | `used[]` |
| 78 | 子集 | Medium | 从 `start` 往后 | `start` |
| 17 | 电话号码的字母组合 | Medium | 当前数字对应字母 | 无重复 |
| 39 | 组合总和 | Medium | 从 `start` 往后（**可重复选**） | `start` + 排序剪枝 |
| 22 | 括号生成 | Medium | 左括号（未用完）/ 右括号（右<左） | 计数剪枝 |
| 79 | 单词搜索 | Medium | 四邻域 | 原地标记 |
| 131 | 分割回文串 | Medium | 下一个切分点 | 回文预处理 |
| 51 | N 皇后 | Hard | 每行选一列 | 列/两条对角线占用表 |

---

:::qa LC 46 · 全排列（Medium｜必刷）

**题目**
给定一个**不含重复数字**的数组 `nums`，返回其**所有可能的全排列**。你可以按任意顺序返回答案。

**示例 1**
```
输入：nums = [1,2,3]
输出：[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
```

**示例 2**
```
输入：nums = [0,1]
输出：[[0,1],[1,0]]
```

**示例 3**
```
输入：nums = [1]
输出：[[1]]
```

**约束**：`1 <= nums.length <= 6`；`-10 <= nums[i] <= 10`；`nums` 中所有整数**互不相同**

**提示 1（方向）**
排列的"顺序重要"，所以每层都可以从**任意**未使用的元素中选 → 需要 `used[]` 数组标记已用元素（不能像组合那样只往后选）。

**提示 2（关键不变量）**
`path.size() == nums.size()` 时收集答案（**叶子节点**才是答案，和子集题不同）。每层遍历全部元素，跳过 `used` 的。

**提示 3（伪代码）**
```
dfs():
    if path.size()==n: res.push(path); return
    for i in 0..n-1:
        if used[i]: continue
        used[i]=true; path.push(a[i]); dfs(); path.pop(); used[i]=false
```

**完整代码**

```cpp
// LC 46 全排列
#include <vector>
using namespace std;

void dfs(vector<int>& nums, vector<int>& path, vector<bool>& used, vector<vector<int>>& res) {
    if (path.size() == nums.size()) {         // 叶子收集
        res.push_back(path);
        return;
    }
    for (int i = 0; i < (int)nums.size(); i++) {
        if (used[i]) continue;
        used[i] = true;
        path.push_back(nums[i]);
        dfs(nums, path, used, res);
        path.pop_back();
        used[i] = false;                      // 回溯
    }
}

vector<vector<int>> permute(vector<int>& nums) {
    vector<vector<int>> res;
    vector<int> path;
    vector<bool> used(nums.size(), false);
    dfs(nums, path, used, res);
    return res;
}
```

**复杂度**：时间 O(n · n!)，空间 O(n)。

**易错点**
- 忘记 `used[i] = false` 回溯 → 只能生成一个排列。
- 用 `start` 而不是 `used` → 生成的是组合不是排列。
- 在非叶子节点就收集答案 → 混成子集。

**面试追问**
- 有重复元素（LC 47）？→ `sort` + `if (i > 0 && a[i] == a[i-1] && !used[i-1]) continue;`
- 第 k 个排列（LC 60）？→ 康托展开，不用回溯。
- 空间能不能优化？→ 用交换法（把已选元素换到前面）省掉 `used` 数组。
:::

:::qa LC 78 · 子集（Medium｜必刷）

**题目**
给你一个整数数组 `nums`，数组中的元素**互不相同**。返回该数组所有可能的子集（幂集）。
解集**不能**包含重复的子集。你可以按任意顺序返回解集。

**示例 1**
```
输入：nums = [1,2,3]
输出：[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]
```

**示例 2**
```
输入：nums = [0]
输出：[[],[0]]
```

**约束**：`1 <= nums.length <= 10`；`-10 <= nums[i] <= 10`；`nums` 中所有元素**互不相同**

**提示 1（方向）**
子集不关心顺序 → 用 `start` 保证"只往后选"，天然避免 `[1,2]` 和 `[2,1]` 重复。

**提示 2（关键不变量）**
**每一个节点都是答案**（包括空集），不是只有叶子收集 —— 这是与全排列最大的区别。

**提示 3（伪代码）**
```
dfs(start):
    res.push(path)                    // 进函数就收集
    for i in start..n-1:
        path.push(a[i]); dfs(i+1); path.pop()
```

**完整代码**

```cpp
// LC 78 子集
#include <vector>
using namespace std;

void dfs(vector<int>& nums, int start, vector<int>& path, vector<vector<int>>& res) {
    res.push_back(path);                  // 每个节点都是一个合法子集
    for (int i = start; i < (int)nums.size(); i++) {
        path.push_back(nums[i]);
        dfs(nums, i + 1, path, res);      // i+1：不能重复选自己
        path.pop_back();
    }
}

vector<vector<int>> subsets(vector<int>& nums) {
    vector<vector<int>> res;
    vector<int> path;
    dfs(nums, 0, path, res);
    return res;
}
```

**复杂度**：时间 O(n · 2ⁿ)，空间 O(n)。

**易错点**
- 只在叶子收集 → 漏掉所有中间子集。
- `dfs(i)` 而不是 `dfs(i+1)` → 变成"可重复选"（那是 LC 39）。
- 忘记 `path.pop_back()`。

**面试追问**
- 有重复元素（LC 90）？→ `sort` + `if (i > start && a[i] == a[i-1]) continue;`（同一层去重）
- 用**位运算**枚举？→ `for (mask = 0; mask < (1<<n); mask++)` 逐位判断，代码更短但不够灵活。
- 什么时候必须用回溯而不能用位运算？→ 需要剪枝或元素可重复选时。
:::

:::qa LC 17 · 电话号码的字母组合（Medium｜必刷）

**题目**
给定一个仅包含数字 `2-9` 的字符串，返回所有它能表示的**字母组合**。答案可以按任意顺序返回。
数字到字母的映射与电话按键相同（`1` 不对应任何字母）：
```
2: abc   3: def   4: ghi   5: jkl   6: mno   7: pqrs   8: tuv   9: wxyz
```

**示例 1**
```
输入：digits = "23"
输出：["ad","ae","af","bd","be","bf","cd","ce","cf"]
```

**示例 2**
```
输入：digits = ""
输出：[]
```

**示例 3**
```
输入：digits = "2"
输出：["a","b","c"]
```

**约束**：`0 <= digits.length <= 4`；`digits[i]` 是 `['2', '9']` 中的数字

**提示 1（方向）**
每一层对应一个数字，选择列表就是"该数字映射的几个字母" → 典型的"多叉树枚举"，不用去重也不用 `used`。

**提示 2（关键不变量）**
层数（`i`）就是 `digits` 的下标，`i == digits.size()` 时收集。**空字符串要提前返回 `{}`**（否则会返回 `[""]`）。

**提示 3（伪代码）**
```
dfs(i):
    if i == len: res.push(cur); return
    for c in map[digits[i]]: cur.push(c); dfs(i+1); cur.pop()
```

**完整代码**

```cpp
// LC 17 电话号码的字母组合
#include <vector>
#include <string>
using namespace std;

const string M[10] = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};

void dfs(const string& d, int i, string& cur, vector<string>& res) {
    if (i == (int)d.size()) { res.push_back(cur); return; }
    for (char c : M[d[i] - '0']) {
        cur.push_back(c);
        dfs(d, i + 1, cur, res);
        cur.pop_back();
    }
}

vector<string> letterCombinations(string digits) {
    vector<string> res;
    if (digits.empty()) return res;      // 必须提前返回，否则会输出 [""]
    string cur;
    dfs(digits, 0, cur, res);
    return res;
}
```

**复杂度**：时间 O(4ⁿ · n)，空间 O(n)。

**易错点**
- 空串没特判 → 返回 `[""]`。
- 映射表写错（`7` 和 `9` 是**四个**字母）。
- 用 `char` 拼接后忘记回溯 `pop_back()`。

**面试追问**
- 规模上限为什么只有 4？→ 组合数 4⁴ = 256，再大就爆。
- 如果要**过滤**某些组合（如不含连续相同字母）？→ 加一个"上一个字符"参数剪枝。
- 这题和"棋盘路径枚举"的共同点？→ 都是"每层从固定集合里选一个"。
:::

:::qa LC 39 · 组合总和（Medium｜必刷）

**题目**
给你一个**无重复元素**的整数数组 `candidates` 和一个目标整数 `target`，找出 `candidates` 中可以使数字和为 `target` 的**所有不同组合**，并以列表形式返回（任意顺序）。
- `candidates` 中的**同一个数字可以无限制重复被选取**；
- 如果至少一个数字的选取数量不同，则两种组合是不同的；
- 保证和为 `target` 的不同组合数少于 150 个。

**示例 1**
```
输入：candidates = [2,3,6,7], target = 7
输出：[[2,2,3],[7]]
解释：2 和 3 可以形成 2+2+3=7；7 单独也可以
```

**示例 2**
```
输入：candidates = [2,3,5], target = 8
输出：[[2,2,2,2],[2,3,3],[3,5]]
```

**示例 3**
```
输入：candidates = [2], target = 1
输出：[]
```

**约束**：`1 <= candidates.length <= 30`；`2 <= candidates[i] <= 40`；元素互不相同；`1 <= target <= 40`

**提示 1（方向）**
"可重复选取" = 递归时下一层传 **`i` 而不是 `i+1`**；但为了避免 `[2,3]` 和 `[3,2]` 重复，仍需 `start` 保证"只往后选"。

**提示 2（关键不变量）**
先 `sort`，然后 `if (candidates[i] > remain) break;` —— 因为数组已有序，后面的只会更大，可以直接跳出循环（这是剪枝的关键，`break` 不是 `continue`）。

**提示 3（伪代码）**
```
dfs(start, remain):
    if remain == 0: res.push(path); return
    for i in start..n-1:
        if a[i] > remain: break          // 剪枝
        path.push(a[i]); dfs(i, remain - a[i]); path.pop()
```

**完整代码**

```cpp
// LC 39 组合总和
#include <vector>
#include <algorithm>
using namespace std;

void dfs(vector<int>& c, int start, int remain, vector<int>& path, vector<vector<int>>& res) {
    if (remain == 0) { res.push_back(path); return; }
    for (int i = start; i < (int)c.size() && c[i] <= remain; i++) {   // 排序后剪枝
        path.push_back(c[i]);
        dfs(c, i, remain - c[i], path, res);      // i：允许重复选自己
        path.pop_back();
    }
}

vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
    sort(candidates.begin(), candidates.end());   // 剪枝的前提
    vector<vector<int>> res;
    vector<int> path;
    dfs(candidates, 0, target, path, res);
    return res;
}
```

**复杂度**：时间 O(S)（S 为所有可行解的节点总数），空间 O(target / min)。

**易错点**
- `dfs(i + 1, ...)` → 变成"每个数只能用一次"（那是 LC 40）。
- 忘记 `sort` → `break` 剪枝失效（数组无序时后面的可能更小）。
- 剪枝用 `continue` 而不是 `break` → 效率下降但没有正确性问题（面试可以说明区别）。

**面试追问**
- 每个数只能用一次（LC 40）？→ `dfs(i + 1)` + 同层去重 `if (i > start && a[i] == a[i-1]) continue;`
- 限制"组合长度为 k"？→ 加层数参数 `depth`，`depth == k` 时判断。
- 为什么解的数量有上界保证？→ 题目给"少于 150 个"，否则输出本身爆炸。
:::

:::qa LC 22 · 括号生成（Medium｜必刷）

**题目**
数字 `n` 代表生成括号的对数，请你设计一个函数，用于能够生成所有可能的并且**有效**的括号组合。

**示例 1**
```
输入：n = 3
输出：["((()))","(()())","(())()","()(())","()()()"]
```

**示例 2**
```
输入：n = 1
输出：["()"]
```

**约束**：`1 <= n <= 8`

**提示 1（方向）**
不用"生成所有 2n 位串再检查合法性"（那是 O(2^2n)），而是在**生成过程中**保证前缀合法 → 只要维护"已用左括号数 `l`"和"已用右括号数 `r`"。

**提示 2（关键不变量）**
两个约束就够：
- 左括号可以放的条件：`l < n`；
- 右括号可以放的条件：`r < l`（**任何前缀里右括号数不能超过左括号数**，这是合法性的充要条件）。

**提示 3（伪代码）**
```
dfs(l, r):
    if l == n and r == n: res.push(cur); return
    if l < n: cur+='('; dfs(l+1, r); cur.pop()
    if r < l: cur+=')'; dfs(l, r+1); cur.pop()
```

**完整代码**

```cpp
// LC 22 括号生成
#include <vector>
#include <string>
using namespace std;

void dfs(int n, int l, int r, string& cur, vector<string>& res) {
    if ((int)cur.size() == 2 * n) { res.push_back(cur); return; }
    if (l < n) {                        // 还能放左括号
        cur.push_back('(');
        dfs(n, l + 1, r, cur, res);
        cur.pop_back();
    }
    if (r < l) {                        // 右括号数不能超过左括号数
        cur.push_back(')');
        dfs(n, l, r + 1, cur, res);
        cur.pop_back();
    }
}

vector<string> generateParenthesis(int n) {
    vector<string> res;
    string cur;
    dfs(n, 0, 0, cur, res);
    return res;
}
```

**复杂度**：时间 O(第 n 个卡特兰数 × n)，空间 O(n)。

**易错点**
- 右括号条件写成 `r < n` → 生成非法串（如 `)(`）。
- 收集条件写成 `l == n` → 提前收集。
- 用 `if...else if` 导致漏掉两条分支都能走的情况。

**面试追问**
- 为什么合法串数量是卡特兰数？→ 合法括号序列与卡特兰数一一对应，`C(2n,n)/(n+1)`。
- 如果要求"字典序第 k 个"？→ 按卡特兰数计数做递归定位。
- 只求**数量**不求方案？→ 直接算卡特兰数，O(n) 或 O(1) 公式。
:::

:::qa LC 79 · 单词搜索（Medium｜必刷）

**题目**
给定一个 `m x n` 二维字符网格 `board` 和一个字符串单词 `word`。如果 `word` 存在于网格中，返回 `true`；否则返回 `false`。
- 单词必须按照字母顺序，通过**相邻**（水平或垂直）的单元格构成；
- **同一个单元格内的字母不允许被重复使用**。

**示例 1**
```
输入：board = [["A","B","C","E"],
               ["S","F","C","S"],
               ["A","D","E","E"]], word = "ABCCED"
输出：true
```

**示例 2**
```
输入：board = 同上, word = "SEE"
输出：true
```

**示例 3**
```
输入：board = 同上, word = "ABCB"
输出：false
```

**约束**：`1 <= m, n <= 6`；`1 <= word.length <= 15`；`board` 和 `word` 仅由大小写英文字母组成

**提示 1（方向）**
对每个格子做一次 DFS，匹配 `word[k]`，四邻域递归。要点是**防止重复使用同一格**。

**提示 2（关键不变量）**
用**原地标记**（把走过的格子改成 `'#'`），递归返回前再改回来 —— 这样连 `visited` 数组都省了，空间 O(1)（除递归栈）。
先判越界和字符不匹配，再判"是否是最后一个字符"（是则直接返回 true，不用标记）。

**提示 3（伪代码）**
```
dfs(i, j, k):
    if 越界 or board[i][j] != word[k]: return false
    if k == len-1: return true
    tmp = board[i][j]; board[i][j] = '#'
    ok = dfs(i±1, j, k+1) or dfs(i, j±1, k+1)
    board[i][j] = tmp            // 回溯
    return ok
```

**完整代码**

```cpp
// LC 79 单词搜索
#include <vector>
#include <string>
using namespace std;

bool dfs(vector<vector<char>>& b, const string& w, int i, int j, int k) {
    if (i < 0 || i >= (int)b.size() || j < 0 || j >= (int)b[0].size()) return false;
    if (b[i][j] != w[k]) return false;
    if (k == (int)w.size() - 1) return true;

    char tmp = b[i][j];
    b[i][j] = '#';                     // 标记已用
    bool ok = dfs(b, w, i + 1, j, k + 1) || dfs(b, w, i - 1, j, k + 1)
           || dfs(b, w, i, j + 1, k + 1) || dfs(b, w, i, j - 1, k + 1);
    b[i][j] = tmp;                     // 回溯
    return ok;
}

bool exist(vector<vector<char>>& board, string word) {
    for (int i = 0; i < (int)board.size(); i++)
        for (int j = 0; j < (int)board[0].size(); j++)
            if (dfs(board, word, i, j, 0)) return true;
    return false;
}
```

**复杂度**：时间 O(m · n · 3^L)（每步最多 3 个新方向，L 为单词长度），空间 O(L)。

**易错点**
- 忘记把 `board[i][j]` 还原 → 后续路径被污染。
- 先标记再判字符是否匹配 → 匹配逻辑乱。
- `k == w.size() - 1` 的判断放在标记之后（放之前更快，且避免无谓的标记还原）。

**面试追问**
- 为什么是 3^L 而不是 4^L？→ 不能立刻回头走刚来的格子，所以每步最多 3 个选择。
- 多个单词要查（LC 212 单词搜索 II）？→ 用 **Trie** 一次 DFS 匹配多个前缀，避免重复遍历。
- 如果允许重复使用格子？→ 去掉标记即可（但可能无限递归，需要限制长度）。
:::

:::qa LC 131 · 分割回文串（Medium｜必刷）

**题目**
给你一个字符串 `s`，请你将 `s` 分割成一些子串，使**每个子串都是回文串**。返回 `s` 所有可能的分割方案。

**示例 1**
```
输入：s = "aab"
输出：[["a","a","b"],["aa","b"]]
```

**示例 2**
```
输入：s = "a"
输出：[["a"]]
```

**约束**：`1 <= s.length <= 16`；`s` 仅由小写英文字母组成

**提示 1（方向）**
"分割"型回溯：每层决定"下一刀切在哪"，切出来的前缀必须是回文才继续。切到末尾时收集。

**提示 2（关键不变量）**
回文判断如果在循环里用 `O(n)` 双指针，总复杂度会到 `O(n · 2ⁿ)`。**预处理回文表** `pal[i][j]` 后判断 O(1)：
`pal[i][j] = (s[i] == s[j]) && (j - i <= 2 || pal[i+1][j-1])`，从后往前填。

**提示 3（伪代码）**
```
预处理 pal[n][n]
dfs(start):
    if start == n: res.push(path); return
    for end in start..n-1:
        if !pal[start][end]: continue
        path.push(s[start..end]); dfs(end+1); path.pop()
```

**完整代码**

```cpp
// LC 131 分割回文串
#include <vector>
#include <string>
using namespace std;

void dfs(const string& s, int start, vector<vector<bool>>& pal,
         vector<string>& path, vector<vector<string>>& res) {
    if (start == (int)s.size()) { res.push_back(path); return; }
    for (int end = start; end < (int)s.size(); end++) {
        if (!pal[start][end]) continue;
        path.push_back(s.substr(start, end - start + 1));
        dfs(s, end + 1, pal, path, res);
        path.pop_back();
    }
}

vector<vector<string>> partition(string s) {
    int n = s.size();
    vector<vector<bool>> pal(n, vector<bool>(n, false));
    for (int i = n - 1; i >= 0; i--)
        for (int j = i; j < n; j++)
            pal[i][j] = (s[i] == s[j]) && (j - i <= 2 || pal[i + 1][j - 1]);

    vector<vector<string>> res;
    vector<string> path;
    dfs(s, 0, pal, path, res);
    return res;
}
```

**复杂度**：时间 O(n · 2ⁿ)（最坏全为同一字符），空间 O(n²)。

**易错点**
- 回文表填表顺序错（必须 `i` 从后往前，因为依赖 `pal[i+1][j-1]`）。
- `j - i <= 2` 这个边界写错（`<= 1` 会漏掉"a?a"长度为 3 的情况）。
- 回溯时忘记 `path.pop_back()`。

**面试追问**
- 如果只求**最少分割次数**（LC 132）？→ DP：`dp[i] = min(dp[j] + 1)`，配合回文表。
- 回文表还能怎么求？→ 中心扩展 O(n²)，或 Manacher O(n)。
- 为什么这题长度上限只有 16？→ 输出本身是指数级。
:::

:::qa LC 51 · N 皇后（Hard｜必刷）

**题目**
按照国际象棋规则，皇后可以攻击与之处在**同一行、同一列或同一斜线**上的棋子。
**n 皇后问题**研究的是如何将 `n` 个皇后放置在 `n×n` 的棋盘上，并且使皇后彼此之间不能相互攻击。
给你一个整数 `n`，返回所有不同的 **n 皇后问题** 的解决方案。
每一种解法包含一个不同的棋子放置方案，该方案中 `'Q'` 和 `'.'` 分别代表皇后和空位。

**示例 1**
```
输入：n = 4
输出：[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]
解释：4 皇后问题存在两个不同的解法
```

**示例 2**
```
输入：n = 1
输出：[["Q"]]
```

**约束**：`1 <= n <= 9`

**提示 1（方向）**
按**行**逐层放置（一行只放一个皇后），每行的选择列表是 `n` 个列。冲突只需检查三个方向：**同列、主对角线、副对角线**。

**提示 2（关键不变量）**
因为按行放置，行冲突天然不存在。三种占用用布尔数组 O(1) 判断：
- 列：`col[c]`
- 主对角线（`r - c` 恒定）：`d1[r - c + n - 1]`
- 副对角线（`r + c` 恒定）：`d2[r + c]`

**提示 3（伪代码）**
```
dfs(row):
    if row == n: res.push(board); return
    for c in 0..n-1:
        if col[c] or d1[row-c+n-1] or d2[row+c]: continue
        三个标记置 true; board[row][c]='Q'
        dfs(row+1)
        board[row][c]='.'; 三个标记置 false
```

**完整代码**

```cpp
// LC 51 N 皇后
#include <vector>
#include <string>
using namespace std;

void dfs(int n, int row, vector<string>& board,
         vector<bool>& col, vector<bool>& d1, vector<bool>& d2,
         vector<vector<string>>& res) {
    if (row == n) { res.push_back(board); return; }

    for (int c = 0; c < n; c++) {
        int i1 = row - c + n - 1;      // 主对角线索引
        int i2 = row + c;              // 副对角线索引
        if (col[c] || d1[i1] || d2[i2]) continue;   // 冲突剪枝

        col[c] = d1[i1] = d2[i2] = true;
        board[row][c] = 'Q';
        dfs(n, row + 1, board, col, d1, d2, res);
        board[row][c] = '.';
        col[c] = d1[i1] = d2[i2] = false;           // 回溯
    }
}

vector<vector<string>> solveNQueens(int n) {
    vector<vector<string>> res;
    vector<string> board(n, string(n, '.'));
    vector<bool> col(n, false), d1(2 * n, false), d2(2 * n, false);
    dfs(n, 0, board, col, d1, d2, res);
    return res;
}
```

**复杂度**：时间 O(n!)（实际远小于，靠剪枝），空间 O(n²)。

**易错点**
- 对角线索引：`r - c` 可能为负 → 加 `n - 1` 偏移；数组大小要 `2n - 1` 以上（这里用 `2n` 更安全）。
- 忘记回溯三个标记 → 后续行被错误剪枝。
- 试图"逐格尝试放/不放"（2 的 n² 次方）而不是"逐行放一个"。

**面试追问**
- 用**位运算**优化怎么写？→ `cols | (1<<c)`、`d1 << 1`、`d2 >> 1` 三个整数表示占用，速度更快。
- 只求方案数（LC 52）？→ 去掉 `board` 记录，只累计计数。
- 为什么按行放置就能保证行不冲突？→ 每行恰好放一个皇后。
:::

---

## 今日复盘四问

1. 什么时候用 `start`、什么时候用 `used`？（组合/子集/分割 → `start`；排列 → `used`）
2. 同一层去重和同一枝去重的代码差别是什么？
3. 39 题"可重复选"的实现关键是什么？（`dfs(i)` 而不是 `dfs(i+1)`）
4. 22 和 51 的剪枝本质是什么？（**用"当前状态的计数/占用表"提前排除非法分支**，而不是生成后再校验）
