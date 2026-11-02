# Day 13 · 堆 / 贪心 / 位运算 / 技巧（12 题）

> 今日考点：**TopK 的两种解法**（堆 vs 快速选择）、**双堆求中位数**、**贪心的"最远可达/最右边界"**、**摩尔投票与异或**、**原地重排**（三指针、下一个排列）、**用下标当哈希 + 快慢指针**。

:::card 堆模板（C++ 里默认是**大根堆**，小根堆要写三个模板参数）
```cpp
// 大根堆（默认）
priority_queue<int> maxHeap;

// 小根堆
priority_queue<int, vector<int>, greater<int>> minHeap;

// 自定义比较（注意：返回值是"a 的优先级是否低于 b"）
struct Cmp { bool operator()(const ListNode* a, const ListNode* b) const { return a->val > b->val; } };  // 小根堆
```
**记忆点**：`greater` → 小根堆；`less`（默认）→ 大根堆。写错方向是最常见的错误。
:::

:::card TopK 三招（面试先报复杂度，再选一个实现）
| 场景 | 方法 | 复杂度 | 说明 |
|---|---|---|---|
| 求第 K 大 | **小根堆**（保留最大的 k 个） | O(n log k) | 代码最短，最稳 |
| 求第 K 大 | **快速选择**（三路划分） | 平均 O(n)，最坏 O(n²) | 需要随机 pivot，面试加分 |
| 求前 K 高频 | 哈希 + 小根堆（按频率） | O(n log k) | 标准解法 |
| 求前 K 高频 | 哈希 + **桶排序**（频率做下标） | O(n) | 频率范围有界时最优 |
:::

| 题号 | 题目 | 难度 | 核心 |
|---|---|---|---|
| 215 | 数组中的第 K 个最大元素 | Medium | 小根堆 / 快速选择 |
| 347 | 前 K 个高频元素 | Medium | 哈希 + 堆 / 桶排序 |
| 295 | 数据流的中位数 | Hard | 大根堆 + 小根堆 |
| 121 | 买卖股票的最佳时机 | Easy | 维护最小价格 |
| 55 | 跳跃游戏 | Medium | 贪心维护最远可达 |
| 45 | 跳跃游戏 II | Medium | 贪心按"层"扩张 |
| 763 | 划分字母区间 | Medium | 记录最后出现位置 |
| 136 | 只出现一次的数字 | Easy | 异或 |
| 169 | 多数元素 | Easy | 摩尔投票 |
| 75 | 颜色分类 | Medium | 三指针（荷兰国旗） |
| 31 | 下一个排列 | Medium | 三步：找上升点→交换→反转 |
| 287 | 寻找重复数 | Medium | 快慢指针（下标当指针） |

---

:::qa LC 215 · 数组中的第 K 个最大元素（Medium｜必刷）

**题目**
给定整数数组 `nums` 和整数 `k`，请返回数组中**第 `k` 个最大的元素**。
请注意，你需要找的是数组**排序后**的第 `k` 个最大的元素，而不是第 `k` 个不同的元素。
你必须设计并实现时间复杂度为 `O(n)` 的算法解决此问题（指快速选择）。

**示例 1**
```
输入：nums = [3,2,1,5,6,4], k = 2
输出：5
```

**示例 2**
```
输入：nums = [3,2,3,1,2,4,5,5,6], k = 4
输出：4
```

**约束**：`1 <= k <= nums.length <= 10^5`；`-10^4 <= nums[i] <= 10^4`

**提示 1（方向）**
两个解法：① 小根堆保留最大的 `k` 个，堆顶就是答案，O(n log k)；② 快速选择（quickselect），平均 O(n)。

**提示 2（关键不变量）**
小根堆的关键：`if (pq.size() > k) pq.pop();` —— 堆里**始终只有 k 个元素**，堆顶是这 k 个里最小的（也就是第 k 大）。

**提示 3（伪代码）**
```
小根堆 pq
for x in nums: pq.push(x); if pq.size() > k: pq.pop()
return pq.top()
```

**完整代码（小根堆）**

```cpp
// LC 215 数组中的第 K 个最大元素（小根堆）
#include <vector>
#include <queue>
using namespace std;

int findKthLargest(vector<int>& nums, int k) {
    priority_queue<int, vector<int>, greater<int>> pq;   // 小根堆：保留最大的 k 个
    for (int x : nums) {
        pq.push(x);
        if ((int)pq.size() > k) pq.pop();               // 弹掉当前最小的
    }
    return pq.top();                                    // 堆顶即第 k 大
}
```

**完整代码（快速选择）**

```cpp
// LC 215 快速选择：三路划分 + 随机 pivot
#include <vector>
#include <cstdlib>
using namespace std;

// 返回 a 中第 k 小（1-indexed）
int quickSelect(vector<int>& a, int l, int r, int k) {
    int p = a[l + rand() % (r - l + 1)];      // 随机 pivot，避免有序数组退化
    int i = l, lt = l, gt = r;
    while (i <= gt) {                          // 三路划分：< p | == p | > p
        if (a[i] < p) swap(a[i++], a[lt++]);
        else if (a[i] > p) swap(a[i], a[gt--]);
        else i++;
    }
    if (k <= lt - l) return quickSelect(a, l, lt - 1, k);
    if (k <= gt - l + 1) return p;
    return quickSelect(a, gt + 1, r, k - (gt - l + 1));
}

int findKthLargest(vector<int>& nums, int k) {
    int n = nums.size();
    return quickSelect(nums, 0, n - 1, n - k + 1);   // 第 k 大 = 第 n-k+1 小
}
```

**复杂度**：堆 O(n log k)/O(k)；快速选择平均 O(n)、最坏 O(n²)/O(1)。

**易错点**
- 小根堆写成 `greater` 之外的形式（默认大根堆则结果是错的）。
- 忘记 `if (size > k) pop()`（要先 push 再判断）。
- 快速选择的"第 k 大"与"第 k 小"下标换算搞反：第 k 大 = 第 `n-k+1` 小。

**面试追问**
- 为什么快速选择是平均 O(n)？→ 每次期望丢弃约一半，`n + n/2 + n/4 + ... = 2n`。
- 数据流式（随时插入）怎么求第 k 大？→ 只能用小根堆维护 k 个（快速选择不适用）。
- 如果 `nums` 有大量重复？→ 三路划分天然处理（比两路快）。

---

:::qa LC 347 · 前 K 个高频元素（Medium｜必刷）

**题目**
给你一个整数数组 `nums` 和一个整数 `k`，请你返回其中出现**频率前 `k` 高**的元素。你可以按任意顺序返回答案。

**示例 1**
```
输入：nums = [1,1,1,2,2,3], k = 2
输出：[1,2]
```

**示例 2**
```
输入：nums = [1], k = 1
输出：[1]
```

**约束**：`1 <= nums.length <= 10^5`；`k` 的取值范围是 `[1, 数组中不相同的元素的个数]`；题目数据保证答案唯一

**提示 1（方向）**
先统计频率（哈希），再从"频率最大的 k 个"里取元素 → 又是 TopK，用**按频率排序的小根堆**。

**提示 2（关键不变量）**
堆里存 `pair<freq, val>`（频率在前，因为 `pair` 默认按第一个元素比较），小根堆保留频率最大的 k 个。

**提示 3（伪代码）**
```
cnt = 哈希计数
小根堆 pq（存 (freq, val)）
for (val, freq) in cnt: pq.push({freq, val}); if pq.size() > k: pq.pop()
return pq 中所有 val
```

**完整代码（哈希 + 小根堆）**

```cpp
// LC 347 前 K 个高频元素
#include <vector>
#include <unordered_map>
#include <queue>
using namespace std;

vector<int> topKFrequent(vector<int>& nums, int k) {
    unordered_map<int, int> cnt;
    for (int x : nums) cnt[x]++;

    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
    for (auto& kv : cnt) {
        pq.push({kv.second, kv.first});          // (频率, 值)
        if ((int)pq.size() > k) pq.pop();
    }

    vector<int> res;
    while (!pq.empty()) {
        res.push_back(pq.top().second);
        pq.pop();
    }
    return res;
}
```

**完整代码（桶排序 O(n)）**

```cpp
// 桶排序：频率做下标（频率不超过 n）
vector<int> topKFrequent(vector<int>& nums, int k) {
    unordered_map<int, int> cnt;
    for (int x : nums) cnt[x]++;
    int n = nums.size();
    vector<vector<int>> bucket(n + 1);           // bucket[f] = 出现 f 次的元素
    for (auto& kv : cnt) bucket[kv.second].push_back(kv.first);

    vector<int> res;
    for (int f = n; f >= 1 && (int)res.size() < k; f--)
        for (int v : bucket[f]) {
            res.push_back(v);
            if ((int)res.size() == k) break;
        }
    return res;
}
```

**复杂度**：堆 O(n log k)；桶排序 O(n)。

**易错点**
- `pair` 顺序写反（`{val, freq}`）→ 变成按值排序。
- 桶数组大小用 `nums.size()` 而不是 `n+1` → 频率等于 `n` 时越界。
- 忘记 `greater` → 大根堆，取到的是频率最低的 k 个。

**面试追问**
- 如果频率范围很大？→ 桶排序不可行，用堆或快速选择。
- 要求按频率**降序输出**？→ 收集后排序，或调整堆的收集顺序。
- 数据流场景？→ 只能维护一个近似的 Count-Min Sketch + 堆。

---

:::qa LC 295 · 数据流的中位数（Hard｜必刷）

**题目**
中位数是有序整数列表中的中间值。如果列表大小是偶数，则没有中间值，中位数是两个中间值的平均值。
- 例如 `arr = [2,3,4]` 的中位数是 `3`
- `arr = [2,3]` 的中位数是 `(2 + 3) / 2 = 2.5`

实现 `MedianFinder` 类：
- `MedianFinder()`：初始化对象
- `void addNum(int num)`：将数据流中的整数 `num` 添加到数据结构中
- `double findMedian()`：返回到目前为止所有元素的中位数

**示例 1**
```
输入：
["MedianFinder","addNum","addNum","findMedian","addNum","findMedian"]
[[],[1],[2],[],[3],[]]
输出：[null,null,null,1.50000,null,2.00000]
```

**约束**：`-10^5 <= num <= 10^5`；调用 `findMedian` 前至少有一个元素；最多 `5 * 10^4` 次调用

**提示 1（方向）**
需要"随时取出中间两个值" → 把数据分成两半：**较小的一半用大根堆**（堆顶是这半的最大值），**较大的一半用小根堆**（堆顶是这半的最小值）。

**提示 2（关键不变量）**
两条不变量：
1. `small.size() == large.size()` 或 `small.size() == large.size() + 1`（大根堆最多多一个）
2. `small.top() <= large.top()`（较小半的最大值 ≤ 较大半的最小值）

`addNum` 的做法：先塞进 `small`，再把 `small` 的最大值挪给 `large`（这一步**自动保证不变量 2**），最后修正大小关系。

**提示 3（伪代码）**
```
addNum(x):
    small.push(x)
    large.push(small.top()); small.pop()
    if large.size() > small.size(): small.push(large.top()); large.pop()
findMedian():
    if small.size() > large.size(): return small.top()
    return (small.top() + large.top()) / 2.0
```

**完整代码**

```cpp
// LC 295 数据流的中位数（双堆）
#include <queue>
using namespace std;

class MedianFinder {
    priority_queue<int> small;                              // 大根堆：较小的一半
    priority_queue<int, vector<int>, greater<int>> large;    // 小根堆：较大的一半

public:
    MedianFinder() {}

    void addNum(int num) {
        small.push(num);
        large.push(small.top());          // 把较小半的最大值挪到较大半
        small.pop();
        if (large.size() > small.size()) { // 维持 small 不少于 large
            small.push(large.top());
            large.pop();
        }
    }

    double findMedian() {
        if (small.size() > large.size()) return small.top();
        return (small.top() + large.top()) / 2.0;
    }
};
```

**复杂度**：`addNum` O(log n)，`findMedian` O(1)；空间 O(n)。

**易错点**
- 只往两个堆里塞，不做"挪一次"的交换 → 不变量 2 被破坏（大小顺序错乱）。
- 整除 `/ 2` 而不是 `/ 2.0` → 丢精度。
- 大小关系允许 `large` 比 `small` 多 → `findMedian` 逻辑要跟着改（容易出错，统一让 `small` 多或相等）。

**面试追问**
- 如果数据全部落在某个区间（可以计数）？→ 用计数数组 + 前缀和，或 Fenwick 树。
- 求"数据流中的第 k 小"？→ 两个堆改成"一个 k 大小的堆 + 一个其余"，思路一样。
- 内存受限怎么办？→ 近似算法（如 t-digest）。

---

:::qa LC 121 · 买卖股票的最佳时机（Easy｜必刷）

**题目**
给定一个数组 `prices`，它的第 `i` 个元素 `prices[i]` 表示一支给定股票第 `i` 天的价格。
你只能选择**某一天**买入这只股票，并选择在**未来的某一个不同的日子**卖出该股票。设计一个算法来计算你所能获取的**最大利润**。
返回你可以从这笔交易中获取的最大利润。如果你不能获取任何利润，返回 `0`。

**示例 1**
```
输入：prices = [7,1,5,3,6,4]
输出：5
解释：在第 2 天（价格 1）买入，第 5 天（价格 6）卖出，利润 6-1=5
```

**示例 2**
```
输入：prices = [7,6,4,3,1]
输出：0
解释：价格一直下跌，不交易，最大利润 0
```

**约束**：`1 <= prices.length <= 10^5`；`0 <= prices[i] <= 10^4`

**提示 1（方向）**
枚举"卖出日"，同时维护它之前的最小价格 → 一次遍历。

**提示 2（关键不变量）**
先算利润再更新最小值（顺序反了会用到当天的价格当买价，虽然本题结果不受影响，但语义错）。

**提示 3（伪代码）**
```
minP = INF, best = 0
for p in prices: best = max(best, p - minP); minP = min(minP, p)
```

**完整代码**

```cpp
// LC 121 买卖股票的最佳时机
#include <vector>
#include <algorithm>
#include <climits>
using namespace std;

int maxProfit(vector<int>& prices) {
    int minP = INT_MAX, best = 0;
    for (int p : prices) {
        best = max(best, p - minP);      // 今天卖出
        minP = min(minP, p);             // 更新历史最低价
    }
    return best;
}
```

**复杂度**：时间 O(n)，空间 O(1)。

**易错点**
- `best` 初始化为 `INT_MIN` → 全下跌时返回负数（题目要求 0）。
- 先更新 `minP` 再算利润 → 允许"当天买当天卖"（本题结果不变，但逻辑不对）。

**面试追问**
- 允许**多次交易**（LC 122）？→ 贪心累加所有上涨段 `max(0, p[i]-p[i-1])`。
- 最多 **2 次**交易（LC 123）？→ DP：`buy1/sell1/buy2/sell2` 四个状态。
- 含**冷冻期**（LC 309）/ 手续费？→ 增加状态维度。

---

:::qa LC 55 · 跳跃游戏（Medium｜必刷）

**题目**
给你一个非负整数数组 `nums`，你最初位于数组的**第一个下标**。数组中的每个元素代表你在该位置可以跳跃的**最大长度**。
判断你是否能够到达**最后一个下标**，如果可以返回 `true`，否则返回 `false`。

**示例 1**
```
输入：nums = [2,3,1,1,4]
输出：true
解释：可以先跳 1 步到下标 1，然后从下标 1 跳 3 步到最后一个下标
```

**示例 2**
```
输入：nums = [3,2,1,0,4]
输出：false
解释：无论怎样都会停在最后一个下标前
```

**约束**：`1 <= nums.length <= 10^4`；`0 <= nums[i] <= 10^5`

**提示 1（方向）**
不用 DP，贪心即可：维护"当前能到达的最远下标" `reach`。

**提示 2（关键不变量）**
遍历时若 `i > reach`，说明 `i` 及之后都到不了 → 直接 `false`。否则 `reach = max(reach, i + nums[i])`。

**提示 3（伪代码）**
```
reach = 0
for i in 0..n-1: if i > reach: return false; reach = max(reach, i + nums[i])
return true
```

**完整代码**

```cpp
// LC 55 跳跃游戏
#include <vector>
#include <algorithm>
using namespace std;

bool canJump(vector<int>& nums) {
    int reach = 0;
    for (int i = 0; i < (int)nums.size(); i++) {
        if (i > reach) return false;               // 走不到 i
        reach = max(reach, i + nums[i]);           // 更新最远可达
    }
    return true;
}
```

**复杂度**：时间 O(n)，空间 O(1)。

**易错点**
- 循环条件写成 `i < reach` → 中途退出，漏判。
- 忘记 `i > reach` 的提前返回 → 结果仍对，但白跑。

**面试追问**
- 如果允许向左右跳？→ 变成图论最短路问题。
- 求**最少步数**？→ 下一题（45）。
- 用 DP 怎么写？→ `dp[i] = 存在 j < i 使 dp[j] && j + nums[j] >= i`，O(n²)。

---

:::qa LC 45 · 跳跃游戏 II（Medium｜必刷）

**题目**
给定一个长度为 `n` 的 **0 索引**整数数组 `nums`。初始位置为 `nums[0]`。
每个元素 `nums[i]` 表示从索引 `i` 向后跳转的**最大长度**。换句话说，如果你在 `nums[i]` 处，你可以跳转到任意 `nums[i + j]` 处（`0 <= j <= nums[i]` 且 `i + j < n`）。
返回到达 `nums[n - 1]` 的**最小跳跃次数**。生成的测试用例可以到达 `nums[n - 1]`。

**示例 1**
```
输入：nums = [2,3,1,1,4]
输出：2
解释：跳 1 步到下标 1，再跳 3 步到最后一个下标
```

**示例 2**
```
输入：nums = [2,3,0,1,4]
输出：2
```

**约束**：`1 <= nums.length <= 10^4`；`0 <= nums[i] <= 1000`；保证可以到达 `nums[n-1]`

**提示 1（方向）**
把"每一次跳跃"看成一"层"：在当前层能到达的所有位置中，取能跳到的最远处作为下一层的边界 → 等价于 BFS，但用贪心 O(1) 空间实现。

**提示 2（关键不变量）**
`curEnd` = 当前这一跳能到达的最远边界；`farthest` = 下一跳能到达的最远位置。
遍历到 `i == curEnd` 时，"这一跳的能量用完了" → `jumps++`、`curEnd = farthest`。

**提示 3（伪代码）**
```
jumps = 0, curEnd = 0, farthest = 0
for i in 0..n-2:
    farthest = max(farthest, i + nums[i])
    if i == curEnd: jumps++; curEnd = farthest
return jumps
```

**完整代码**

```cpp
// LC 45 跳跃游戏 II
#include <vector>
#include <algorithm>
using namespace std;

int jump(vector<int>& nums) {
    int n = nums.size();
    if (n <= 1) return 0;
    int jumps = 0, curEnd = 0, farthest = 0;
    for (int i = 0; i < n - 1; i++) {          // 注意只到 n-2
        farthest = max(farthest, i + nums[i]);
        if (i == curEnd) {                     // 当前层的边界到了，必须再跳一次
            jumps++;
            curEnd = farthest;
            if (curEnd >= n - 1) break;        // 提前结束
        }
    }
    return jumps;
}
```

**复杂度**：时间 O(n)，空间 O(1)。

**易错点**
- 循环到 `n-1` → 多算一次跳跃。
- 忘记 `curEnd >= n-1` 的提前退出（不影响正确性，但会被追问）。
- 与 55 混淆：55 判断可达性，45 求最少步数。

**面试追问**
- BFS 写法？→ 按层扩展，复杂度同为 O(n) 但需要队列。
- 为什么贪心是对的？→ 每一层内所有位置的"下一步最远距离"可以合并成下一层的边界，与具体落点无关。
- 如果某些位置是障碍（不能落）？→ 贪心失效，需要 BFS/DP。

---

:::qa LC 763 · 划分字母区间（Medium｜必刷）

**题目**
给你一个字符串 `s`。我们要把这个字符串划分为**尽可能多的片段**，同一字母最多出现在一个片段中。
注意，划分结果需要满足：将所有划分结果按顺序连接，得到的字符串仍然是 `s`。
返回一个表示每个字符串片段的长度的列表。

**示例 1**
```
输入：s = "ababcbacadefegdehijhklij"
输出：[9,7,8]
解释：
划分结果为 "ababcbaca"、"defegde"、"hijhklij"
```

**示例 2**
```
输入：s = "eccbbbbdec"
输出：[10]
```

**约束**：`1 <= s.length <= 500`；`s` 仅由小写英文字母组成

**提示 1（方向）**
"同一字母只能在一个片段里" → 片段的右边界至少要到"该片段内所有字母的**最后出现位置**"的最大值。

**提示 2（关键不变量）**
先记录每个字母的最后出现下标；然后遍历，`end = max(end, last[s[i]])`。当 `i == end` 时，说明这个片段已经"闭合"，可以切了。

**提示 3（伪代码）**
```
last[c] = 每个字母最后出现的下标
start = 0, end = 0
for i in 0..n-1:
    end = max(end, last[s[i]])
    if i == end: res.push(end-start+1); start = i+1
```

**完整代码**

```cpp
// LC 763 划分字母区间
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

vector<int> partitionLabels(string s) {
    int last[26] = {0};
    for (int i = 0; i < (int)s.size(); i++) last[s[i] - 'a'] = i;

    vector<int> res;
    int start = 0, end = 0;
    for (int i = 0; i < (int)s.size(); i++) {
        end = max(end, last[s[i] - 'a']);      // 扩张当前片段的右边界
        if (i == end) {                        // 闭合
            res.push_back(end - start + 1);
            start = i + 1;
        }
    }
    return res;
}
```

**复杂度**：时间 O(n)，空间 O(1)（26 个字母）。

**易错点**
- 只按"第一次出现"切 → 后面的重复字母被切开。
- `end` 忘记取 `max`（直接在 `last[s[i]]` 上覆盖）→ 右边界回退。

**面试追问**
- 如果要求"每个字母最多出现在 k 个片段"？→ 变成另一类贪心/二分题。
- 与"合并区间"的共同点？→ 都是"扩张右边界直到闭合"。
- 为什么答案是最多片段数？→ 每次在"最早可行位置"切断，贪心最优。

---

:::qa LC 136 · 只出现一次的数字（Easy｜必刷）

**题目**
给你一个**非空**整数数组 `nums`，除了某个元素只出现一次以外，其余每个元素均出现**两次**。找出那个只出现了一次的元素。
你必须设计并实现**线性时间**复杂度的算法来解决此问题，且该算法只使用**常量额外空间**。

**示例 1**
```
输入：nums = [2,2,1]
输出：1
```

**示例 2**
```
输入：nums = [4,1,2,1,2]
输出：4
```

**示例 3**
```
输入：nums = [1]
输出：1
```

**约束**：`1 <= nums.length <= 3 * 10^4`；`-3 * 10^4 <= nums[i] <= 3 * 10^4`；除某元素仅出现一次外，其余每个元素都恰出现两次

**提示 1（方向）**
哈希表能做到 O(n) 时间但需要 O(n) 空间。要 O(1) 空间 → 用**异或**的性质。

**提示 2（关键不变量）**
`a ^ a = 0`、`a ^ 0 = a`、异或满足交换律与结合律 → 全部异或起来，成对的都抵消，剩下那个就是答案。

**提示 3（伪代码）**
```
x = 0
for v in nums: x ^= v
return x
```

**完整代码**

```cpp
// LC 136 只出现一次的数字
#include <vector>
using namespace std;

int singleNumber(vector<int>& nums) {
    int x = 0;
    for (int v : nums) x ^= v;
    return x;
}
```

**复杂度**：时间 O(n)，空间 O(1)。

**易错点**
- 用排序（O(n log n)）能过但不是最优，会被追问。
- 使用 `-3*10^4` 这样的负数：异或对补码同样成立，无需特殊处理。

**面试追问**
- 如果有**两个**元素只出现一次（LC 260）？→ 全部异或得到 `a^b`，取最低位的 1 分组异或。
- 如果其余元素出现**三次**（LC 137）？→ 位计数取模 3，或双状态 `ones/twos`。
- 如果出现一次的元素有两个且要求 O(1) 空间？→ 同 LC 260 的分组法。

---

:::qa LC 169 · 多数元素（Easy｜必刷）

**题目**
给定一个大小为 `n` 的数组 `nums`，返回其中的**多数元素**。多数元素是指在数组中出现次数**大于 `⌊ n/2 ⌋`** 的元素。
你可以假设数组是非空的，并且给定的数组总是存在多数元素。

**示例 1**
```
输入：nums = [3,2,3]
输出：3
```

**示例 2**
```
输入：nums = [2,2,1,1,1,2,2]
输出：2
```

**约束**：`n == nums.length`；`1 <= n <= 5 * 10^4`；`-10^9 <= nums[i] <= 10^9`
**进阶**：尝试设计 O(n) 时间、O(1) 空间的算法。

**提示 1（方向）**
摩尔投票（Boyer-Moore）：多数元素出现次数超过一半，所以"把它和其他元素两两抵消"，最后剩下的必然是它。

**提示 2（关键不变量）**
`cand` 是当前候选，`cnt` 是它的"票数（未被抵消的数量）"。遇到相同 +1，不同 -1，归零就换候选。
**为什么对**：多数元素的票数比其他所有元素之和还多，抵消到最后一定还剩。

**提示 3（伪代码）**
```
cand = 0, cnt = 0
for x in nums:
    if cnt == 0: cand = x, cnt = 1
    elif x == cand: cnt++
    else: cnt--
return cand
```

**完整代码**

```cpp
// LC 169 多数元素（摩尔投票）
#include <vector>
using namespace std;

int majorityElement(vector<int>& nums) {
    int cand = 0, cnt = 0;
    for (int x : nums) {
        if (cnt == 0) { cand = x; cnt = 1; }
        else if (x == cand) cnt++;
        else cnt--;
    }
    return cand;
}
```

**复杂度**：时间 O(n)，空间 O(1)。

**易错点**
- 在"不保证存在多数元素"的题目里直接返回 `cand` → 必须再扫一遍验证计数。
- `cnt` 初始化为 1 且 `cand = nums[0]` 也能过，但要保证空数组不越界。

**面试追问**
- 如果不保证存在多数元素？→ 第二遍验证 `cnt(cand) > n/2`。
- 找出现次数 **> n/3** 的元素（LC 229）？→ 推广：维护两个候选、两个计数。
- 还能怎么做？→ 排序取中间（O(n log n)），或哈希计数（O(n) 空间）。

---

:::qa LC 75 · 颜色分类（Medium｜必刷）

**题目**
给定一个包含红色、白色和蓝色、共 `n` 个元素的数组 `nums`，**原地**对它们进行排序，使得相同颜色的元素相邻，并按照红色、白色、蓝色顺序排列。
我们使用整数 `0`、`1` 和 `2` 分别表示红色、白色和蓝色。
必须在不使用库内置的 `sort` 函数的情况下解决这个问题。

**示例 1**
```
输入：nums = [2,0,2,1,1,0]
输出：[0,0,1,1,2,2]
```

**示例 2**
```
输入：nums = [2,0,1]
输出：[0,1,2]
```

**约束**：`n == nums.length`；`1 <= n <= 300`；`nums[i]` 为 `0`、`1` 或 `2`
**进阶**：仅使用常数空间的一趟扫描算法。

**提示 1（方向）**
荷兰国旗问题：三个指针把数组分成"已排好的 0 区 | 未处理的中间区 | 已排好的 2 区"。

**提示 2（关键不变量）**
`l` 指向 0 区右边界、`r` 指向 2 区左边界、`i` 是当前扫描位置。
交换 `a[i]` 与 `a[r]` 时 **`i` 不能自增**（换过来的元素还没检查）。

**提示 3（伪代码）**
```
l = 0, i = 0, r = n-1
while i <= r:
    if a[i] == 0: swap(a[l++], a[i++])
    elif a[i] == 2: swap(a[i], a[r--])     // i 不动
    else: i++
```

**完整代码**

```cpp
// LC 75 颜色分类（荷兰国旗三指针）
#include <vector>
#include <algorithm>
using namespace std;

void sortColors(vector<int>& a) {
    int l = 0, i = 0, r = (int)a.size() - 1;
    while (i <= r) {
        if (a[i] == 0)      swap(a[l++], a[i++]);
        else if (a[i] == 2) swap(a[i], a[r--]);   // 关键：i 不自增
        else                i++;
    }
}
```

**复杂度**：时间 O(n)（一趟），空间 O(1)。

**易错点**
- `a[i] == 2` 分支里也 `i++` → 换过来的元素被跳过，答案错。
- 循环条件写成 `i < r` → 漏掉最后一个元素。
- 用计数排序（两趟）也能过，但被追问"一趟怎么做"时要能写这个。

**面试追问**
- 如果有 4 种颜色？→ 三指针法不直接扩展，用计数排序（两趟）或多路划分。
- 如何证明一趟 O(n)？→ `i` 单调递增且 `r` 单调递减，两者最多相遇一次。
- 与快速排序的三路划分什么关系？→ 完全同构（`< pivot | == pivot | > pivot`）。

---

:::qa LC 31 · 下一个排列（Medium｜必刷）

**题目**
整数数组的一个**排列**就是将其所有成员以序列或线性顺序排列。
整数数组的**下一个排列**是指其整数的**下一个字典序更大的排列**。更正式地，如果数组的所有排列根据其字典顺序从小到大排列，那么数组的下一个排列就是在这个有序容器中排在它后面的那个排列。如果不存在下一个更大的排列，那么这个数组必须重排为字典序最小的排列（即升序排列）。
给你一个整数数组 `nums`，找出 `nums` 的下一个排列。
必须**原地**修改，只允许使用额外**常数**空间。

**示例 1**
```
输入：nums = [1,2,3]
输出：[1,3,2]
```

**示例 2**
```
输入：nums = [3,2,1]
输出：[1,2,3]
```

**示例 3**
```
输入：nums = [1,1,5]
输出：[1,5,1]
```

**约束**：`1 <= nums.length <= 100`；`0 <= nums[i] <= 100`

**提示 1（方向）**
三步：① 从右往左找第一个**下降点** `i`（`a[i] < a[i+1]`）；② 从右往左找第一个**比 `a[i]` 大**的元素 `j`，交换；③ 把 `i+1` 到末尾**反转**（原来是降序，反转后变升序）。

**提示 2（关键不变量）**
- 若找不到下降点 → 整个数组降序，说明是最大排列 → 直接反转成最小排列。
- 步骤 ② 找到的 `j` 一定是"最靠右的比 `a[i]` 大的"，交换后 `i+1..n-1` 仍保持降序，所以反转即得最小后缀。

**提示 3（伪代码）**
```
i = n-2; while i >= 0 and a[i] >= a[i+1]: i--
if i >= 0: j = n-1; while a[j] <= a[i]: j--; swap(a[i], a[j])
reverse(a[i+1..n-1])
```

**完整代码**

```cpp
// LC 31 下一个排列
#include <vector>
#include <algorithm>
using namespace std;

void nextPermutation(vector<int>& a) {
    int n = a.size(), i = n - 2;
    while (i >= 0 && a[i] >= a[i + 1]) i--;        // ① 找下降点

    if (i >= 0) {
        int j = n - 1;
        while (a[j] <= a[i]) j--;                  // ② 找最靠右的更大元素
        swap(a[i], a[j]);
    }
    reverse(a.begin() + i + 1, a.end());           // ③ 后缀反转成升序
}
```

**复杂度**：时间 O(n)，空间 O(1)。

**易错点**
- 找下降点的条件写成 `a[i] > a[i+1]`（应为 `>=`，否则相等元素会导致错误）。
- 步骤 ② 从头找（应从右往左，保证"最靠右"）。
- 忘记 `i < 0` 时仍要反转（`a.begin() + i + 1` = `a.begin()`，逻辑天然正确）。

**面试追问**
- 上一个排列怎么写？→ 对称：找第一个上升点，找最靠右的比它小的，交换后**反转**后缀（原为升序→变降序）。
- 第 k 个排列（LC 60）？→ 康托展开 + 阶乘定位，O(n²) 或 O(n log n)。
- `next_permutation` 能直接调吗？→ 能，但面试就是考你能不能手写。

---

:::qa LC 287 · 寻找重复数（Medium｜必刷）

**题目**
给定一个包含 `n + 1` 个整数的数组 `nums`，其数字都在 `[1, n]` 范围内（包括 1 和 n），可知**至少存在一个重复的整数**。
假设 `nums` **只有一个**重复的整数，返回这个重复的数。
你设计的解决方案必须**不修改**数组 `nums`，且只用常量级 `O(1)` 的额外空间。

**示例 1**
```
输入：nums = [1,3,4,2,2]
输出：2
```

**示例 2**
```
输入：nums = [3,1,3,4,2]
输出：3
```

**示例 3**
```
输入：nums = [1,1]
输出：1
```

**约束**：`1 <= n <= 10^5`；`nums.length == n + 1`；`1 <= nums[i] <= n`；只有一个整数出现两次或多次，其余只出现一次

**提示 1（方向）**
把数组看成一个**链表**：`i → nums[i]`。因为值域是 `[1, n]` 且有 `n+1` 个元素，这条"链表"必然**有环**，而**入环点就是重复的数** → 直接套 LC 142。

**提示 2（关键不变量）**
Floyd 判圈：快慢指针相遇后，一个指针回到起点，两者同步走，再次相遇处即入环点（= 重复数字）。

**提示 3（伪代码）**
```
slow = fast = nums[0]
do: slow = nums[slow]; fast = nums[nums[fast]] while slow != fast
slow = nums[0]
while slow != fast: slow = nums[slow]; fast = nums[fast]
return slow
```

**完整代码（快慢指针）**

```cpp
// LC 287 寻找重复数（下标当指针，套用环形链表 II）
#include <vector>
using namespace std;

int findDuplicate(vector<int>& nums) {
    int slow = nums[0], fast = nums[0];
    do {
        slow = nums[slow];                 // 走一步
        fast = nums[nums[fast]];           // 走两步
    } while (slow != fast);

    slow = nums[0];                        // 回到起点
    while (slow != fast) {
        slow = nums[slow];
        fast = nums[fast];
    }
    return slow;
}
```

**完整代码（二分答案）**

```cpp
// LC 287 二分：统计 <= mid 的个数
int findDuplicate(vector<int>& nums) {
    int l = 1, r = (int)nums.size() - 1;
    while (l < r) {
        int mid = l + (r - l) / 2;
        int cnt = 0;
        for (int x : nums) if (x <= mid) cnt++;
        if (cnt > mid) r = mid;            // 重复数在 [l, mid]
        else l = mid + 1;
    }
    return l;
}
```

**复杂度**：快慢指针 O(n)/O(1)；二分 O(n log n)/O(1)。

**易错点**
- 快慢指针的 `do-while` 写成 `while` → 初始 `slow == fast`，直接退出。
- `fast = nums[nums[fast]]` 越界（本题值域保证不越界）。
- 二分版忘记"不改数组"这个前提（它不改，符合要求）。

**面试追问**
- 为什么一定有环？→ `n+1` 个元素、值域 `[1,n]`，必有重复 → 必有环。
- 为什么入环点就是重复数？→ 有两个不同的下标指向同一个值，正是"入环点被两次指向"。
- 允许修改数组时最快？→ 原地标记 `nums[abs(x)] *= -1`，O(n)/O(1)。

---

## 今日复盘四问

1. TopK 的堆解法为什么是"小根堆"？（要淘汰的是"当前最小的"，所以堆顶必须是最小值）
2. 双堆求中位数，两条不变量分别是什么？
3. 45 的贪心为什么不能直接套 55 的写法？（55 只要可达性，45 要求最少步数 → 必须按"层"扩张）
4. 287 为什么能变成"找环的入口"？（数组本身就是"下标 → 值"的函数图）
