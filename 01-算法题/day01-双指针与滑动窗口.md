# Day 1 · 双指针 / 滑动窗口（6 题）

> 今日考点：**对撞双指针**（有序性 → 单调性 → 可以丢弃一侧）、**滑动窗口**（窗口内统计量 + 何时缩左）。
> 每题结构：完整题干 → 示例 → 约束 → 提示阶梯 ×3 → 完整 C++ → 复杂度 → 易错点 → 追问。**卡住 10 分钟再看下一级提示**。
> 手机上用 `🎯 抽背` 刷：只显示题号题目，自己先写，点开才看提示与代码。

| 题号 | 题目 | 难度 | 模板一句话 | 复杂度 |
|---|---|---|---|---|
| 1 | 两数之和 | Easy | 哈希查补数，先查再放 | O(n) / O(n) |
| 15 | 三数之和 | Medium | 排序 + 固定一个 + 夹逼 + 三处去重 | O(n²) / O(1) |
| 11 | 盛最多水的容器 | Medium | 对撞指针，移动矮的一边 | O(n) / O(1) |
| 3 | 无重复字符的最长子串 | Medium | 窗口 + 上次出现位置 | O(n) / O(Σ) |
| 76 | 最小覆盖子串 | Hard | 窗口 + valid 计数（种类数） | O(n+m) / O(Σ) |
| 42 | 接雨水 | Hard | 较小一侧的最大值决定水位 | O(n) / O(1) |

---

:::qa LC 1 · 两数之和（Easy｜必刷）

**题目**
给定一个整数数组 `nums` 和一个整数目标值 `target`，请在该数组中找出**和为 `target` 的两个整数**，并返回它们的**数组下标**。
- 每种输入只会对应**一个**答案；同一个元素不能重复使用（不能自己配自己）。
- 返回值顺序任意。

**示例 1**
```
输入：nums = [2,7,11,15], target = 9
输出：[0,1]
解释：nums[0] + nums[1] = 2 + 7 = 9
```

**示例 2**
```
输入：nums = [3,2,4], target = 6
输出：[1,2]
```

**示例 3**
```
输入：nums = [3,3], target = 6
输出：[0,1]     ← 同一个值可以出现两次，但必须是两个不同下标
```

**约束**
- `2 <= nums.length <= 10^4`
- `-10^9 <= nums[i], target <= 10^9`
- 只会存在一个有效答案

**提示 1（方向）**
两层循环 O(n²)。要降到 O(n)，就得把"找另一个数"从线性查找变成 O(1) 查询 —— 什么结构能做"值 → 下标"的映射？

**提示 2（关键不变量）**
遍历到 `i` 时，哈希表里只存 `0..i-1` 的元素。所以查到 `target - nums[i]` 一定是**前面**出现过、且不等于 `i` 的下标。**先查后放**这个顺序，本身就是"同一元素不用两次"的保证。

**提示 3（伪代码）**
```
mp = {}
for i in 0..n-1:
    need = target - nums[i]
    if need in mp: return [mp[need], i]
    mp[nums[i]] = i
```

**完整代码**

```cpp
// LC 1 两数之和
// 哈希查补数：边扫边查，先查再放，避免自己配自己
#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> mp;                 // 值 -> 下标
    for (int i = 0; i < (int)nums.size(); i++) {
        int need = target - nums[i];
        if (mp.count(need)) return {mp[need], i};   // 先查：命中的一定是更早的下标
        mp[nums[i]] = i;                            // 再放：本轮不参与匹配
    }
    return {};
}
```

**复杂度**：时间 O(n)，空间 O(n)。

**易错点**
- 先放后查 → `nums=[3,3], target=6` 会返回 `[1,1]`。
- `mp[need]` 判存在会顺手插入 0 值条目；用 `count` 或 `find`。
- `i` 与 `nums.size()` 比较时的有符号/无符号警告（我习惯显式 `(int)`）。

**面试追问**
- 数组**已排序**？→ 对撞双指针 O(n)/O(1)，但只能返回值不能返回原下标。
- 要返回**所有**不重复数对？→ 排序 + 双指针 + 跳过重复。
- 数据流式到达、随时可查？→ 边插边查的哈希本身就是在线的。
:::

:::qa LC 15 · 三数之和（Medium｜必刷）

**题目**
给你一个整数数组 `nums`，判断是否存在三元组 `[nums[i], nums[j], nums[k]]` 满足 `i != j != k` 且 `nums[i] + nums[j] + nums[k] == 0`。
请返回所有**和为 0 且不重复**的三元组。
> 注意：答案中**不可以包含重复的三元组**（元素相同视为同一个三元组）。

**示例 1**
```
输入：nums = [-1,0,1,2,-1,-4]
输出：[[-1,-1,2],[-1,0,1]]
解释：不同的三元组是 [-1,0,1] 和 [-1,-1,2]；注意顺序和重复项都不算新答案
```

**示例 2**
```
输入：nums = [0,1,1]
输出：[]
解释：唯一可能的三元组和不为 0
```

**示例 3**
```
输入：nums = [0,0,0]
输出：[[0,0,0]]
```

**约束**
- `3 <= nums.length <= 3000`
- `-10^5 <= nums[i] <= 10^5`

**提示 1（方向）**
三层循环 O(n³) 必超时。先排序，固定第一个数 `i`，问题退化成"在 `i+1..n-1` 里找两数之和为 `-nums[i]`"，而**排好序的数组上两数之和可以 O(n) 双指针**，总体 O(n²)。

**提示 2（关键不变量）**
有序时若 `nums[l] + nums[r] < 目标`，那么 `nums[l]` 与任何更靠左的 `r'` 组合只会更小 → `l` 可以安全右移。这是"丢弃一侧不丢解"的单调性论证，也是面试官要听的正确性理由。

去重有**三处**：固定位 `i`、命中后的 `l`、命中后的 `r`。漏一处就会重复输出。

**提示 3（伪代码）**
```
sort(nums)
for i in 0..n-3:
    if i>0 and nums[i]==nums[i-1]: continue
    if nums[i] > 0: break
    l=i+1, r=n-1
    while l<r:
        s = nums[i]+nums[l]+nums[r]
        if s<0: l++
        elif s>0: r--
        else: 记录; l 跳过重复; r 跳过重复; l++, r--
```

**完整代码**

```cpp
// LC 15 三数之和
// 排序 + 固定一个 + 对撞双指针 + 三处去重
#include <vector>
#include <algorithm>
using namespace std;

vector<vector<int>> threeSum(vector<int>& nums) {
    sort(nums.begin(), nums.end());
    vector<vector<int>> res;
    int n = nums.size();

    for (int i = 0; i + 2 < n; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;   // 去重①：固定位
        if (nums[i] > 0) break;                          // 三数都 >=0 不可能凑 0

        int l = i + 1, r = n - 1;
        while (l < r) {
            int s = nums[i] + nums[l] + nums[r];
            if (s < 0)      l++;
            else if (s > 0) r--;
            else {
                res.push_back({nums[i], nums[l], nums[r]});
                while (l < r && nums[l] == nums[l + 1]) l++;   // 去重②：左
                while (l < r && nums[r] == nums[r - 1]) r--;   // 去重③：右
                l++; r--;
            }
        }
    }
    return res;
}
```

**复杂度**：时间 O(n²)，空间 O(1)（不计返回结果）。

**易错点**
- 只去重一处 → 输出重复三元组。
- `while (l < r && ...)` 漏掉 `l < r` → 越界。
- 命中后忘记 `l++; r--;` → 死循环。

**面试追问**
- 四数之和（LC 18）？→ 外层再套一层 + 同样的去重，O(n³)。
- 要求**最接近** 0 的三元组（LC 16）？→ 双指针过程中维护最小绝对差。
- 为什么排序不破坏答案？→ 返回的是**值组合**不是下标组合；若要下标需另存原下标。
:::

:::qa LC 11 · 盛最多水的容器（Medium｜必刷）

**题目**
给定一个长度为 `n` 的整数数组 `height`。有 `n` 条垂线，第 `i` 条线的两个端点是 `(i, 0)` 和 `(i, height[i])`。
找出其中两条线，使它们与 x 轴共同构成的容器可以容纳**最多**的水，返回该最大容量。
> 容器不能倾斜；容量 = `min(height[i], height[j]) * (j - i)`。

**示例 1**
```
输入：height = [1,8,6,2,5,4,8,3,7]
输出：49
解释：取 i=1（高 8）与 j=8（高 7），容量 = min(8,7) * (8-1) = 7*7 = 49
```

**示例 2**
```
输入：height = [1,1]
输出：1
```

**约束**
- `n == height.length`
- `2 <= n <= 10^5`
- `0 <= height[i] <= 10^4`

**提示 1（方向）**
面积由"较矮的一边 × 宽度"决定。宽度随指针内移**必然减小**，所以只有让较矮的一边变高，面积才可能变大 → 每次移动**矮**的那一侧。

**提示 2（关键不变量）**
设当前 `height[l] <= height[r]`。若保留 `l` 只移动 `r`：宽度变小，高度上限仍是 `height[l]`，面积不可能超过当前值。所以以 `l` 为左边界的所有解**已经枚举完**，`l` 可以安全丢弃。反之亦然。

**提示 3（伪代码）**
```
l=0, r=n-1, best=0
while l<r:
    best = max(best, (r-l)*min(h[l],h[r]))
    if h[l] < h[r]: l++ else r--
```

**完整代码**

```cpp
// LC 11 盛最多水的容器
// 对撞双指针：每次移动较矮的一侧，因为移动高的一侧只会让面积更小
#include <vector>
#include <algorithm>
using namespace std;

int maxArea(vector<int>& height) {
    int l = 0, r = (int)height.size() - 1, best = 0;
    while (l < r) {
        best = max(best, (r - l) * min(height[l], height[r]));
        if (height[l] < height[r]) l++;   // 矮的一侧是瓶颈
        else r--;
    }
    return best;
}
```

**复杂度**：时间 O(n)，空间 O(1)。

**易错点**
- 与 LC 42 接雨水搞混：**这题是选两条线求最大面积，不是逐位置积水求和**。
- 写成移动高的一侧（返回值会偏小，且多数用例能过，最危险）。
- 循环里两个分支都不移动 → 死循环。

**面试追问**
- 严格证明为什么可以丢矮的一侧？→ 用提示 2 的不变量论证，这是本题唯一考点。
- 如果高度可以为负？→ 题意不成立，需澄清。
:::

:::qa LC 3 · 无重复字符的最长子串（Medium｜必刷）

**题目**
给定一个字符串 `s`，请你找出其中**不含有重复字符的最长子串**的长度。
> 子串必须**连续**（区别于子序列）。

**示例 1**
```
输入：s = "abcabcbb"
输出：3
解释：最长无重复子串是 "abc"，长度 3
```

**示例 2**
```
输入：s = "bbbbb"
输出：1
解释：最长无重复子串是 "b"
```

**示例 3**
```
输入：s = "pwwkew"
输出：3
解释：最长无重复子串是 "wke"；注意 "pwke" 是子序列不是子串
```

**示例 4**
```
输入：s = ""
输出：0
```

**约束**
- `0 <= s.length <= 5 * 10^4`
- `s` 由英文字母、数字、符号和空格组成

**提示 1（方向）**
"连续 + 最长 + 合法性随右边界扩张单调恶化" → 滑动窗口。窗口内维护每个字符**最后一次出现的下标**。

**提示 2（关键不变量）**
窗口 `[l, r]` 内始终无重复。当 `s[r]` 上次出现在 `last >= l` 时，左边界必须跳到 `last + 1`。
注意 `l` **只能右移**：如果写成 `l = last + 1` 而不判 `>= l`，`l` 可能被拉回左边，答案偏大。

**提示 3（伪代码）**
```
last[128] = -1
l=0, best=0
for r in 0..n-1:
    if last[s[r]] >= l: l = last[s[r]] + 1
    last[s[r]] = r
    best = max(best, r-l+1)
```

**完整代码**

```cpp
// LC 3 无重复字符的最长子串
// 滑动窗口 + 字符上次出现位置：左界只能右移
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

int lengthOfLongestSubstring(string s) {
    vector<int> last(128, -1);          // ASCII 字符 -> 上次出现的下标
    int l = 0, best = 0;
    for (int r = 0; r < (int)s.size(); r++) {
        if (last[s[r]] >= l) l = last[s[r]] + 1;   // 跳到重复字符之后
        last[s[r]] = r;
        best = max(best, r - l + 1);
    }
    return best;
}
```

**复杂度**：时间 O(n)，空间 O(字符集)（此处 O(128)）。

**易错点**
- `l` 被回退（见提示 2）。
- 先更新 `last` 再判断 → 自己跟自己重复。
- 用 `while` 收缩也可以，但边界更容易写错。

**面试追问**
- 字符集扩到 Unicode？→ `unordered_map<char32_t,int>` 或 `unordered_map<unsigned char,int>`。
- 要返回**子串本身**？→ 多记一个 `bestStart`。
- 最多允许 K 个重复字符（LC 340）？→ 窗口内维护"不同字符种类计数 ≤ K+1"。
:::

:::qa LC 76 · 最小覆盖子串（Hard｜必刷）

**题目**
给你一个字符串 `s` 和一个字符串 `t`。返回 `s` 中涵盖 `t` **所有字符**（包含重复字符）的最短子串。如果 `s` 中不存在涵盖 `t` 全部字符的子串，返回空字符串 `""`。
> 若 `s` 中存在多个符合条件的子串，返回其中**最短**的；若长度相同，题目保证答案唯一。

**示例 1**
```
输入：s = "ADOBECODEBANC", t = "ABC"
输出："BANC"
解释：最短覆盖子串 "BANC" 已包含 A、B、C 各一次
```

**示例 2**
```
输入：s = "a", t = "a"
输出："a"
```

**示例 3**
```
输入：s = "a", t = "aa"
输出：""
解释：t 中两个 'a' 都需要被覆盖，而 s 只有一个
```

**约束**
- `1 <= s.length, t.length <= 10^5`
- `s` 和 `t` 由英文字母组成

**提示 1（方向）**
"覆盖 t"是可在窗口内增量维护的可行性条件 → 滑动窗口：右扩到覆盖，然后尽量缩左，**每次缩之前**记录最优。

**提示 2（关键不变量）**
用 `valid` 记录"已达标字符**种类数**"，只在计数**跨过阈值**的瞬间 ±1（`cnt[c] == need[c]` 或 `cnt[c] == need[c]-1`），于是"是否覆盖"是 O(1) 判断，不必每次遍历 t。阈值是 `need.size()`（种类数），不是 `t.size()`（长度）。

**提示 3（伪代码）**
```
need = 计数(t); needKind = need.size(); valid = 0
l=0; start=0; minLen=INF
for r in 0..n-1:
    cnt[s[r]]++; if need 含 s[r] and 达标: valid++
    while valid == needKind:
        更新最优（此时窗口合法）
        cnt[s[l]]--; if 掉出阈值: valid--
        l++
```

**完整代码**

```cpp
// LC 76 最小覆盖子串
// 滑动窗口 + valid 计数：只在跨越阈值瞬间加减，O(1) 判断是否覆盖
#include <string>
#include <unordered_map>
#include <climits>
using namespace std;

string minWindow(string s, string t) {
    unordered_map<char, int> need, cnt;
    for (char c : t) need[c]++;

    int needKind = (int)need.size();   // t 中不同字符种类数
    int l = 0, valid = 0;              // valid: 已满足的种类数
    int start = 0, minLen = INT_MAX;

    for (int r = 0; r < (int)s.size(); r++) {
        char c = s[r];
        cnt[c]++;
        if (need.count(c) && cnt[c] == need[c]) valid++;   // 刚好达标

        while (valid == needKind) {
            if (r - l + 1 < minLen) {                      // 先记录，再缩左
                minLen = r - l + 1;
                start = l;
            }
            char d = s[l];
            cnt[d]--;
            if (need.count(d) && cnt[d] == need[d] - 1) valid--;  // 掉出阈值
            l++;
        }
    }
    return minLen == INT_MAX ? "" : s.substr(start, minLen);
}
```

**复杂度**：时间 O(|s| + |t|)，空间 O(字符集)。

**易错点**
- 缩左**之后**才记录答案 → 把非法窗口算进去（你的 README 里已记过这条）。
- 漏 `need.count(c)` → 无关字符也会把 `valid` 加高。
- 阈值误用 `t.size()` → `t` 有重复字符时永远不达标。

**面试追问**
- `t` 含重复字符？→ `need` 存次数、`valid` 数种类，天然覆盖。
- 与 LC 438/567 的关系？→ 那两题是"固定长度窗口 + 同样计数法"。
- 为什么是 O(n)？→ 左右指针各最多遍历一遍。
:::

:::qa LC 42 · 接雨水（Hard｜必刷）

**题目**
给定 `n` 个非负整数表示每个宽度为 1 的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水。

**示例 1**
```
输入：height = [0,1,0,2,1,0,1,3,2,1,2,1]
输出：6
解释：蓝色区域（下标 2,4,5,6,8,10 各 1 单位）合计 6
```

**示例 2**
```
输入：height = [4,2,0,3,2,5]
输出：9
```

**约束**
- `n == height.length`
- `1 <= n <= 2 * 10^4`
- `0 <= height[i] <= 10^5`

**提示 1（方向）**
位置 `i` 的水位 = `min(左边最高, 右边最高) - height[i]`。逐位置求两侧最大值是 O(n²)；预处理两个数组 O(n)/O(n)；**双指针可 O(1) 空间**。

**提示 2（关键不变量）**
维护 `lmax = max(h[0..l])`、`rmax = max(h[r..n-1])`。
若 `lmax < rmax`，那么 `l` 处的水位**只由 `lmax` 决定**（右侧一定存在不低于 `lmax` 的柱子），可立刻结算并 `l++`；否则对称处理 `r`。

**提示 3（伪代码）**
```
l=0, r=n-1, lmax=rmax=0, res=0
while l<r:
    lmax=max(lmax,h[l]); rmax=max(rmax,h[r])
    if lmax < rmax: res += lmax - h[l]; l++
    else:           res += rmax - h[r]; r--
```

**完整代码**

```cpp
// LC 42 接雨水
// 双指针 O(1) 空间：较小的一侧的当前最大值决定该位置水位
#include <vector>
#include <algorithm>
using namespace std;

int trap(vector<int>& h) {
    int l = 0, r = (int)h.size() - 1;
    int lmax = 0, rmax = 0, res = 0;
    while (l < r) {
        lmax = max(lmax, h[l]);        // 先更新当前侧最大值
        rmax = max(rmax, h[r]);
        if (lmax < rmax) { res += lmax - h[l]; l++; }   // l 处水位由 lmax 决定
        else             { res += rmax - h[r]; r--; }
    }
    return res;
}
```

**复杂度**：时间 O(n)，空间 O(1)。

**易错点**
- 先结算再更新 `lmax/rmax` → 少算。
- 写 `min(lmax,rmax) - h[i]` 又不判负 → 出现负数。
- 与 LC 11 混淆（11 求两线最大面积，42 求逐位置积水之和）。

**面试追问**
- **单调栈**解法怎么讲？→ 维护递减栈，遇到更高的柱子就弹栈按"横向水槽"结算，O(n)/O(n)。
- **前后缀最大值**解法？→ `pre[i]=max(pre[i-1],h[i])`、`suf` 倒算，再逐位 `min(pre,suf)-h[i]`。
- 二维接雨水（LC 407）？→ 最小堆从边界向内灌。
:::

---

## 今日复盘三问（合上文档自己答）

1. 对撞双指针的**共同前提**是什么？（有序性/单调性 → 让你能安全丢弃一侧）
2. 滑窗什么时候用 `valid 种类计数`、什么时候用 `last 位置数组`？（要覆盖**多重集合**用计数；只要求**不重复**用位置）
3. 六题里哪两道最容易被追问"为什么可行"？（11 和 42，都靠单调性/最大值论证）
