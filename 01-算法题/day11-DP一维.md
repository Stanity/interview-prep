# Day 11 · DP I（一维 DP）（8 题）

> 今日考点：**DP 五步法**、**一维状态定义**、**滚动变量**（空间从 O(n) 降到 O(1)）、**"多状态并行"**（152 的最大/最小同时维护）。

:::card DP 五步法（每题按顺序写，写在纸上再动笔）
1. **状态定义**：`dp[i]` 到底表示什么？——**必须能一句话说清**，含"以 i 结尾"还是"前 i 个"
2. **转移方程**：`dp[i]` 由哪些更小的状态得到？这是唯一真正需要想的一步
3. **初始化**：`dp[0]` 或 `dp[0][0]` 是什么？边界为什么这样取？
4. **遍历顺序**：由"依赖方向"决定（一维从小到大；二维看依赖是左上、上方还是左方）
5. **空间优化**：能不能只留前一两行/前两个变量？
:::

:::card 状态定义速查表（面试时先归类，再写方程）
| 题型 | 状态定义 | 典型题 |
|---|---|---|
| 线性计数 | `dp[i]` = 到第 i 阶/第 i 个的方案数 | 70 爬楼梯、118 杨辉三角 |
| 线性选或不选 | `dp[i]` = 前 i 个元素的最优值 | 198 打家劫舍 |
| 完全背包 | `dp[j]` = 凑成金额/和为 j 的**最少物品数** | 322 零钱兑换、279 完全平方数 |
| 字符串切分 | `dp[i]` = 前缀 `s[0..i-1]` 能否/最优 | 139 单词拆分 |
| "以 i 结尾" | `dp[i]` = **以 i 结尾**的最优 | 300 LIS |
| 双状态并行 | `maxP[i] / minP[i]` 同时维护 | 152 乘积最大子数组 |

**一句话判别**：题目问"方案数/最少/最大"→ 想 `dp[i]` 的含义；题目有"负数/乘积"→ 想是否需要**同时维护最大和最小**。
:::

| 题号 | 题目 | 难度 | 状态 |
|---|---|---|---|
| 70 | 爬楼梯 | Easy | `dp[i] = dp[i-1] + dp[i-2]` |
| 118 | 杨辉三角 | Easy | 上一行相邻两项之和 |
| 198 | 打家劫舍 | Medium | `dp[i] = max(dp[i-1], dp[i-2] + 值)` |
| 279 | 完全平方数 | Medium | 完全背包求最小数量 |
| 322 | 零钱兑换 | Medium | 完全背包求最小数量 |
| 139 | 单词拆分 | Medium | 前缀可切分 |
| 300 | 最长递增子序列 | Medium | 以 i 结尾的 LIS |
| 152 | 乘积最大子数组 | Medium | max/min 双状态 |

---

:::qa LC 70 · 爬楼梯（Easy｜必刷）

**题目**
假设你正在爬楼梯，需要 `n` 阶你才能到达楼顶。每次你可以爬 `1` 或 `2` 个台阶。你有多少种不同的方法可以爬到楼顶？

**示例 1**
```
输入：n = 2
输出：2
解释：1+1 或 2
```

**示例 2**
```
输入：n = 3
输出：3
解释：1+1+1、1+2、2+1
```

**约束**：`1 <= n <= 45`

**提示 1（方向）**
到最后一步只有两种可能：从 `n-1` 走 1 阶，或从 `n-2` 走 2 阶 → **斐波那契**。

**提示 2（关键不变量）**
`dp[i] = dp[i-1] + dp[i-2]`，只依赖前两项 → 可以用两个滚动变量把空间降到 O(1)。注意 `dp[1] = 1, dp[2] = 2`。

**提示 3（伪代码）**
```
a = dp[1] = 1, b = dp[2] = 2
for i in 3..n: c = a + b; a = b; b = c
return b
```

**完整代码**

```cpp
// LC 70 爬楼梯
int climbStairs(int n) {
    if (n <= 2) return n;
    int a = 1, b = 2;                  // dp[1], dp[2]
    for (int i = 3; i <= n; i++) {
        int c = a + b;
        a = b;
        b = c;
    }
    return b;
}
```

**复杂度**：时间 O(n)，空间 O(1)。

**易错点**
- `dp[0] = 0` 初始化 → 从 2 开始就错。正确是 `dp[0] = 1`（空方案）或直接特判 n ≤ 2。
- 用递归不记忆化 → O(2ⁿ) 超时。
- 滚动变量赋值顺序写反。

**面试追问**
- 每次可以爬 1..m 阶？→ `dp[i] = sum(dp[i-1..i-m])`，可维持滑动窗口和 O(n)。
- 不能连续走 2 阶？→ 增加状态维度（上一步走了几阶）。
- 结果超 int 怎么办？→ 取模或换 `long long`（本题 n ≤ 45 用 int 刚好）。
:::

:::qa LC 118 · 杨辉三角（Easy｜必刷）

**题目**
给定一个非负整数 `numRows`，生成「杨辉三角」的前 `numRows` 行。
在「杨辉三角」中，每个数是它**左上方**和**右上方**的数之和。

**示例 1**
```
输入：numRows = 5
输出：[[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]
```

**示例 2**
```
输入：numRows = 1
输出：[[1]]
```

**约束**：`1 <= numRows <= 30`

**提示 1（方向）**
第 `i` 行有 `i+1` 个数，首尾都是 1，中间的 `res[i][j] = res[i-1][j-1] + res[i-1][j]`。

**提示 2（关键不变量）**
先 `resize(i+1, 1)` 把整行填成 1，再从 `j = 1` 到 `j = i-1` 覆盖中间项 —— 这样就不用特判首尾。

**提示 3（伪代码）**
```
for i in 0..numRows-1:
    row.resize(i+1, 1)
    for j in 1..i-1: row[j] = prev[j-1] + prev[j]
```

**完整代码**

```cpp
// LC 118 杨辉三角
#include <vector>
using namespace std;

vector<vector<int>> generate(int numRows) {
    vector<vector<int>> res(numRows);
    for (int i = 0; i < numRows; i++) {
        res[i].resize(i + 1, 1);                     // 首尾都是 1
        for (int j = 1; j < i; j++)
            res[i][j] = res[i - 1][j - 1] + res[i - 1][j];
    }
    return res;
}
```

**复杂度**：时间 O(numRows²)，空间 O(numRows²)（输出本身）。

**易错点**
- `j` 范围写成 `1..i` → 越界或覆盖尾部的 1。
- 忘记 `resize(i+1, 1)` → 下标越界。

**面试追问**
- 只要第 k 行（LC 119）？→ 用一维数组**倒序**更新：`row[j] += row[j-1]`（从后往前，避免覆盖上一行）。
- 求第 n 行第 k 个数的组合数公式？→ `C(n-1, k-1)`。
:::

:::qa LC 198 · 打家劫舍（Medium｜必刷）

**题目**
你是一个专业的小偷，计划偷窃沿街的房屋。每间房内都藏有一定的现金，影响你偷窃的唯一制约因素是**相邻的房屋装有相互连通的防盗系统**，如果两间相邻的房屋在同一晚上被闯入，系统会自动报警。
给定一个代表每个房屋存放金额的非负整数数组，计算你在**不触动警报装置**的情况下，一夜之内能够偷窃到的最高金额。

**示例 1**
```
输入：nums = [1,2,3,1]
输出：4
解释：偷 1 号房（1）和 3 号房（3），总额 4
```

**示例 2**
```
输入：nums = [2,7,9,3,1]
输出：12
解释：偷 1、3、5 号房（2+9+1=12）
```

**约束**：`1 <= nums.length <= 100`；`0 <= nums[i] <= 400`

**提示 1（方向）**
每个房子"偷或不偷"两选一 → `dp[i] = max(不偷第 i 间 = dp[i-1], 偷第 i 间 = dp[i-2] + nums[i])`。

**提示 2（关键不变量）**
只依赖 `dp[i-1]` 和 `dp[i-2]` → 两个滚动变量即可。
初始：`prev2 = dp[-1] = 0`、`prev1 = dp[0] = 0`（用"空/一个"的语义处理边界）。

**提示 3（伪代码）**
```
prev2 = 0, prev1 = 0
for x in nums:
    cur = max(prev1, prev2 + x)
    prev2 = prev1; prev1 = cur
return prev1
```

**完整代码**

```cpp
// LC 198 打家劫舍
#include <vector>
#include <algorithm>
using namespace std;

int rob(vector<int>& nums) {
    int prev2 = 0, prev1 = 0;          // dp[i-2], dp[i-1]
    for (int x : nums) {
        int cur = max(prev1, prev2 + x);   // 不偷 / 偷
        prev2 = prev1;
        prev1 = cur;
    }
    return prev1;
}
```

**复杂度**：时间 O(n)，空间 O(1)。

**易错点**
- 初始化成 `prev1 = nums[0]` 后循环从 1 开始 → 空数组会越界（题目保证非空，但写法要统一）。
- 写成 `max(prev2 + x, nums[i])` → 丢掉"累加前面最优"的语义。

**面试追问**
- 房屋围成**环**（LC 213）？→ 分成"偷第一间不偷最后一间"和"不偷第一间偷最后一间"两种情况，各跑一次。
- 房屋是**树**（LC 337）？→ 树形 DP：每节点返回 `(偷, 不偷)` 两个值。
- 要返回**具体偷了哪些房**？→ 记录决策或反向回溯 dp 表。
:::

:::qa LC 279 · 完全平方数（Medium｜必刷）

**题目**
给你一个整数 `n`，返回**和为 `n` 的完全平方数的最少数量**。
完全平方数是一个整数，其值等于另一个整数的平方（如 `1, 4, 9, 16`；`3` 和 `11` 不是）。

**示例 1**
```
输入：n = 12
输出：3
解释：12 = 4 + 4 + 4
```

**示例 2**
```
输入：n = 13
输出：2
解释：13 = 4 + 9
```

**约束**：`1 <= n <= 10^4`

**提示 1（方向）**
本质是**完全背包**：物品是 `1, 4, 9, ..., k²`（可重复使用），容量是 `n`，求**最少物品数**。

**提示 2（关键不变量）**
`dp[j] = min(dp[j], dp[j - sq] + 1)`。因为物品可以无限用，内层容量**正序**遍历。
初始化 `dp[0] = 0`，其余 `INT_MAX`（不可达）。

**提示 3（伪代码）**
```
dp[0..n] = INF; dp[0] = 0
for sq in {1,4,9,...} while sq <= n:
    for j in sq..n:  dp[j] = min(dp[j], dp[j-sq] + 1)
return dp[n]
```

**完整代码**

```cpp
// LC 279 完全平方数
#include <vector>
#include <climits>
#include <algorithm>
using namespace std;

int numSquares(int n) {
    vector<int> dp(n + 1, INT_MAX);
    dp[0] = 0;
    for (int i = 1; i * i <= n; i++) {        // 物品：完全平方数
        int sq = i * i;
        for (int j = sq; j <= n; j++)         // 正序：可重复使用
            dp[j] = min(dp[j], dp[j - sq] + 1);
    }
    return dp[n];
}
```

**复杂度**：时间 O(n√n)，空间 O(n)。

**易错点**
- 内层**倒序** → 变成 0-1 背包（每个平方数只能用一次），结果偏大。
- 忘记判 `dp[j - sq] == INT_MAX`（本题从 sq 开始遍历，`dp[j-sq]` 一定可达，所以可以不判；但写成通用模板时要判）。
- 用 `dp[0] = 1` 初始化 → 全错。

**面试追问**
- 数学解法？→ **四平方和定理**：答案只可能是 1/2/3/4，判定条件是 `n = 4^a(8b+7)`；O(√n) 即可。
- 与 LC 322 的差别？→ 322 的物品是任意面额，本题是平方数序列；**转移和遍历完全相同**。
- 如果要求返回**具体组合**？→ 记录选择，反向回溯。
:::

:::qa LC 322 · 零钱兑换（Medium｜必刷）

**题目**
给你一个整数数组 `coins`，表示不同面额的硬币；以及一个整数 `amount`，表示总金额。
计算并返回可以凑成总金额所需的**最少的硬币个数**。如果没有任何一种硬币组合能组成总金额，返回 `-1`。
你可以认为每种硬币的数量是**无限的**。

**示例 1**
```
输入：coins = [1,2,5], amount = 11
输出：3
解释：11 = 5 + 5 + 1
```

**示例 2**
```
输入：coins = [2], amount = 3
输出：-1
```

**示例 3**
```
输入：coins = [1], amount = 0
输出：0
```

**约束**：`1 <= coins.length <= 12`；`1 <= coins[i] <= 2^31 - 1`；`0 <= amount <= 10^4`

**提示 1（方向）**
完全背包求最少数量：`dp[j] = min(dp[j], dp[j - coin] + 1)`。

**提示 2（关键不变量）**
先遍历**金额**、再遍历**硬币**（顺序其实都可，只要内层/外层配合正确）；不可达状态要跳过，否则 `INT_MAX + 1` 溢出。

**提示 3（伪代码）**
```
dp[0]=0，其余 INF
for j in 1..amount:
    for c in coins:
        if j >= c and dp[j-c] != INF: dp[j] = min(dp[j], dp[j-c]+1)
return dp[amount] == INF ? -1 : dp[amount]
```

**完整代码**

```cpp
// LC 322 零钱兑换
#include <vector>
#include <climits>
#include <algorithm>
using namespace std;

int coinChange(vector<int>& coins, int amount) {
    vector<int> dp(amount + 1, INT_MAX);
    dp[0] = 0;
    for (int j = 1; j <= amount; j++) {
        for (int c : coins) {
            if (j >= c && dp[j - c] != INT_MAX)
                dp[j] = min(dp[j], dp[j - c] + 1);
        }
    }
    return dp[amount] == INT_MAX ? -1 : dp[amount];
}
```

**复杂度**：时间 O(amount × k)，空间 O(amount)。

**易错点**
- 不判 `dp[j-c] != INT_MAX` → `INT_MAX + 1` 溢出成负数，答案错。
- 忘记最后把 `INT_MAX` 转成 `-1`。
- `amount = 0` 时没处理好（`dp[0] = 0` 自然正确）。

**面试追问**
- 求"**组合数**"而不是最少硬币（LC 518）？→ 外层物品、内层正序容量，`dp[j] += dp[j-c]`。
- 硬币面额有 0 或超大？→ 需要过滤（工程题目常见）。
- 贪心为什么不行？→ 反例：coins = [1,3,4], amount = 6，贪心得 4+1+1=3 枚，最优是 3+3=2 枚。
:::

:::qa LC 139 · 单词拆分（Medium｜必刷）

**题目**
给你一个字符串 `s` 和一个字符串列表 `wordDict` 作为字典。如果可以利用字典中出现的一个或多个单词拼接出 `s` 则返回 `true`。
- 不要求字典中出现的单词全部都使用；
- 字典中的单词**可以重复使用**。

**示例 1**
```
输入：s = "leetcode", wordDict = ["leet","code"]
输出：true
```

**示例 2**
```
输入：s = "applepenapple", wordDict = ["apple","pen"]
输出：true
解释：可重复使用 "apple"
```

**示例 3**
```
输入：s = "catsandog", wordDict = ["cats","dog","sand","and","cat"]
输出：false
```

**约束**：`1 <= s.length <= 300`；`1 <= wordDict.length <= 1000`；`1 <= wordDict[i].length <= 20`；均只含小写字母；字典中字符串互不相同

**提示 1（方向）**
`dp[i]` = 前缀 `s[0..i-1]` 能否被拆分。转移：存在 `j < i` 使 `dp[j] == true` 且 `s[j..i-1]` 在字典里。

**提示 2（关键不变量）**
`dp[0] = true`（空串可拆分）。起点 `j` 只需从 `max(0, i - maxLen)` 开始枚举（剪枝：不可能匹配更长的单词）。

**提示 3（伪代码）**
```
dp[0] = true
for i in 1..n:
    for j in [max(0,i-maxLen) .. i-1]:
        if dp[j] and dict.count(s[j..i-1]): dp[i] = true; break
return dp[n]
```

**完整代码**

```cpp
// LC 139 单词拆分
#include <string>
#include <vector>
#include <unordered_set>
#include <algorithm>
using namespace std;

bool wordBreak(string s, vector<string>& wordDict) {
    unordered_set<string> dict(wordDict.begin(), wordDict.end());
    int n = s.size(), maxLen = 0;
    for (auto& w : wordDict) maxLen = max(maxLen, (int)w.size());

    vector<bool> dp(n + 1, false);
    dp[0] = true;                                  // 空串可拆分

    for (int i = 1; i <= n; i++) {
        for (int j = max(0, i - maxLen); j < i; j++) {
            if (dp[j] && dict.count(s.substr(j, i - j))) {
                dp[i] = true;
                break;
            }
        }
    }
    return dp[n];
}
```

**复杂度**：时间 O(n · maxLen · L)（`substr` 会拷贝），空间 O(n)。

**易错点**
- `dp[0] = false` → 永远拆不出来。
- 忘记 `break`（不影响正确性，但慢）。
- `substr(j, i - j)` 的第二个参数是**长度**不是结束下标。

**面试追问**
- 要返回**所有拆分方案**（LC 140）？→ 回溯 + 记忆化（`unordered_map<int, vector<string>>`）。
- 怎么避免 `substr` 拷贝？→ 用 Trie 或字符串哈希（滚动哈希）做 O(1) 匹配。
- 为什么可以用 DP 而不是暴力回溯？→ 有重叠子问题（同一前缀会被多次判断）。
:::

:::qa LC 300 · 最长递增子序列（Medium｜必刷）

**题目**
给你一个整数数组 `nums`，找到其中**最长严格递增子序列**的长度。
**子序列**是由数组派生而来的序列，删除（或不删除）数组中的元素而不改变其余元素的顺序。

**示例 1**
```
输入：nums = [10,9,2,5,3,7,101,18]
输出：4
解释：最长递增子序列是 [2,3,7,101]，长度 4
```

**示例 2**
```
输入：nums = [0,1,0,3,2,3]
输出：4
```

**示例 3**
```
输入：nums = [7,7,7,7,7,7,7]
输出：1
```

**约束**：`1 <= nums.length <= 2500`；`-10^4 <= nums[i] <= 10^4`
**进阶**：O(n log n)。

**提示 1（方向）**
`dp[i]` = **以 `i` 结尾**的最长递增子序列长度（注意"以 i 结尾"是必须的，否则无法转移）。
`dp[i] = 1 + max(dp[j])`，其中 `j < i && nums[j] < nums[i]`。

**提示 2（关键不变量）**
答案是 `max(dp)`，不是 `dp[n-1]`。
O(n log n) 的做法用**贪心 + 二分**：维护 `tails[k]` = "长度为 k+1 的递增子序列的**最小结尾值**"，遍历时用 `lower_bound` 替换第一个 `>= x` 的位置。

**提示 3（伪代码）**
```
// O(n log n)
tails = []
for x in nums:
    it = lower_bound(tails, x)
    if it == end: tails.push(x) else *it = x
return tails.size()
```

**完整代码（O(n²) DP）**

```cpp
// LC 300 最长递增子序列（DP O(n^2)）
#include <vector>
#include <algorithm>
using namespace std;

int lengthOfLIS(vector<int>& nums) {
    int n = nums.size(), best = 1;
    vector<int> dp(n, 1);
    for (int i = 1; i < n; i++) {
        for (int j = 0; j < i; j++)
            if (nums[j] < nums[i]) dp[i] = max(dp[i], dp[j] + 1);
        best = max(best, dp[i]);
    }
    return best;
}
```

**完整代码（O(n log n) 贪心 + 二分）**

```cpp
// LC 300 最长递增子序列（贪心 + 二分）
#include <vector>
#include <algorithm>
using namespace std;

int lengthOfLIS(vector<int>& nums) {
    vector<int> tails;                 // tails[k] = 长度 k+1 的递增子序列的最小结尾
    for (int x : nums) {
        auto it = lower_bound(tails.begin(), tails.end(), x);   // 第一个 >= x
        if (it == tails.end()) tails.push_back(x);              // 可以接在最长序列后面
        else *it = x;                                           // 替换，让结尾更小
    }
    return tails.size();
}
```

**复杂度**：DP O(n²)；贪心+二分 O(n log n)。

**易错点**
- 返回 `dp[n-1]` 而不是 `max(dp)`。
- 严格递增用 `lower_bound`；**非严格递增**（允许相等）要用 `upper_bound`。
- 贪心版**无法还原具体序列**（只能求长度）—— 面试要说清这一点。

**面试追问**
- 要输出**具体的最长递增子序列**？→ 只能用 O(n²) DP + 记录前驱。
- 求"最长递增子数组"（必须连续）？→ 变成遍历比较相邻元素，O(n)。
- 俄罗斯套娃信封（LC 354）？→ 排序（宽升序、高降序）+ 对高做 LIS。
:::

:::qa LC 152 · 乘积最大子数组（Medium｜必刷）

**题目**
给你一个整数数组 `nums`，请你找出数组中**乘积最大的非空连续子数组**（该子数组中至少包含一个数字），并返回该子数组所对应的乘积。
> 测试用例的答案是一个 32 位整数。

**示例 1**
```
输入：nums = [2,3,-2,4]
输出：6
解释：子数组 [2,3] 有最大乘积 6
```

**示例 2**
```
输入：nums = [-2,0,-1]
输出：0
解释：结果不能为 2，因为 [-2,-1] 不是子数组
```

**约束**：`1 <= nums.length <= 2 * 10^4`；`-10 <= nums[i] <= 10`；保证任意前缀/后缀乘积在 32 位内

**提示 1（方向）**
有负数 → "最小的负数 × 负数"会变成最大。所以必须**同时维护以 i 结尾的最大值和最小值**。

**提示 2（关键不变量）**
`maxP[i] = max(nums[i], maxP[i-1]*nums[i], minP[i-1]*nums[i])`
`minP[i] = min(nums[i], maxP[i-1]*nums[i], minP[i-1]*nums[i])`
注意 `maxP/minP` 的更新要用**同一轮的旧值**，不能先更新 `maxP` 再算 `minP`。

**提示 3（伪代码）**
```
maxP = minP = best = nums[0]
for i in 1..n-1:
    a = maxP * nums[i]; b = minP * nums[i]
    maxP = max({nums[i], a, b}); minP = min({nums[i], a, b})
    best = max(best, maxP)
return best
```

**完整代码**

```cpp
// LC 152 乘积最大子数组
#include <vector>
#include <algorithm>
using namespace std;

int maxProduct(vector<int>& nums) {
    int maxP = nums[0], minP = nums[0], best = nums[0];
    for (int i = 1; i < (int)nums.size(); i++) {
        int a = maxP * nums[i];        // 用旧值算
        int b = minP * nums[i];
        maxP = max({nums[i], a, b});
        minP = min({nums[i], a, b});
        best = max(best, maxP);
    }
    return best;
}
```

**复杂度**：时间 O(n)，空间 O(1)。

**易错点**
- 只维护最大值 → 遇到两个负数相乘会漏解（最典型的错）。
- 先更新 `maxP` 再用新 `maxP` 算 `minP` → 结果错。
- 结果初始化成 0 → 全负数数组错（如 `[-2]` 应返回 -2）。

**面试追问**
- 求和的最大子数组（LC 53）为什么不用维护最小值？→ 加法没有"负负得正"。
- 如果 `nums[i]` 可能是 0？→ 会被 `nums[i]` 这一项自然处理（重新起头）。
- 结果会溢出吗？→ 题目保证在 32 位内；否则要用 `long long` 并讨论取模。
:::

---

## 今日复盘四问

1. DP 五步里唯一真正需要想的是哪一步？（**状态定义**——想清了转移方程自然出来）
2. 322 和 279 的代码几乎一样，差别在哪？（物品集合不同；**都是完全背包，内层正序**）
3. 300 的 `dp[i]` 为什么必须定义成"以 i 结尾"？（否则无法判断能否接在后面）
4. 152 为什么必须同时维护 min？（负数会翻转大小关系）
