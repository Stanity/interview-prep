# Day 8 · 二叉树 II（8 题）

> 今日考点：**BST 的中序性质**、**自顶向下传状态 vs 自底向上返回值**、**前缀和搬到树上**、**LCA 的返回值语义**、**序列化必须能唯一还原**。

:::card 承接 Day 7 的四步法，今天新增两个判断
1. **"能不能只靠返回值解决？"**
   - 236 LCA：返回值是"找到的节点或 null"，**语义特殊但不需全局变量**
   - 124 最大路径和：需要在节点处结算 → **必须全局变量**（与 543 同构）
2. **"要不要在递归里带一个'历史状态'？"**
   - 437 路径总和 III：需要"从根到当前的前缀和" → **参数传递 + 回溯撤销**

| 题号 | 题目 | 难度 | 核心 |
|---|---|---|---|
| 230 | BST 中第 K 小的元素 | Medium | 中序 + 提前退出 |
| 199 | 二叉树的右视图 | Medium | BFS 取每层最后一个 |
| 114 | 二叉树展开为链表 | Medium | 前序 + 找左子树最右节点 |
| 105 | 从前序与中序构造二叉树 | Medium | 定位根 + 区间划分 |
| 437 | 路径总和 III | Medium | 树上前缀和 + 回溯 |
| 236 | 二叉树的最近公共祖先 | Medium | 后序返回"找到的节点" |
| 124 | 二叉树中的最大路径和 | Hard | 全局 max + 单边返回 |
| 297 | 二叉树序列化与反序列化 | Hard | 带 null 标记的先序 |

---

:::qa LC 230 · 二叉搜索树中第 K 小的元素（Medium｜必刷）

**题目**
给定一个二叉搜索树的根节点 `root`，和一个整数 `k`，请你设计一个算法查找其中**第 `k` 小**的元素（从 `1` 开始计数）。

**示例 1**
```
输入：root = [3,1,4,null,2], k = 1
输出：1
```

**示例 2**
```
输入：root = [5,3,6,2,4,null,null,1], k = 3
输出：3
```

**约束**：节点数 `n` 满足 `1 <= k <= n <= 10^4`；`0 <= Node.val <= 10^4`

**提示 1（方向）**
BST 的**中序遍历是升序**，所以"第 k 小"就是中序遍历到的第 k 个节点 → 走到第 k 个就可以**提前返回**。

**提示 2（关键不变量）**
用迭代中序（显式栈）最方便提前退出：每弹出一个节点就 `--k`，减到 0 就是答案。

**提示 3（伪代码）**
```
while cur 或 st 非空:
    while cur: st.push(cur); cur = cur->left
    cur = st.pop(); if (--k == 0) return cur->val
    cur = cur->right
```

**完整代码**

```cpp
// LC 230 BST 中第 K 小的元素（迭代中序 + 提前退出）
#include <stack>
using namespace std;

int kthSmallest(TreeNode* root, int k) {
    stack<TreeNode*> st;
    TreeNode* cur = root;
    while (cur || !st.empty()) {
        while (cur) { st.push(cur); cur = cur->left; }
        cur = st.top(); st.pop();
        if (--k == 0) return cur->val;      // 第 k 个
        cur = cur->right;
    }
    return -1;                              // 题目保证 k 合法
}
```

**复杂度**：时间 O(h + k)（不必遍历全树），空间 O(h)。

**易错点**
- 用 `k--` 而不是 `--k`（差一位）。
- 递归写法无法提前退出（会遍历整棵树），但也能过。
- 忘记 `cur = cur->right`。

**面试追问**
- 如果树**频繁增删**且要频繁查第 k 小？→ 节点里存"子树大小"，O(log n) 定位。
- 如果允许修改树结构？→ 转成有序数组或跳表思想。
:::

:::qa LC 199 · 二叉树的右视图（Medium｜必刷）

**题目**
给定一个二叉树的根节点 `root`，想象自己站在它的右侧，按照从顶部到底部的顺序，返回从右侧所能看到的节点值。

**示例 1**
```
输入：root = [1,2,3,null,5,null,4]
输出：[1,3,4]
```

**示例 2**
```
输入：root = [1,null,3]
输出：[1,3]
```

**示例 3**
```
输入：root = []
输出：[]
```

**约束**：节点数范围 `[0, 100]`；`-100 <= Node.val <= 100`

**提示 1（方向）**
"从右侧看" = **每层最右边的节点** → 直接复用层序遍历，取每层最后一个。

**提示 2（关键不变量）**
要么在 BFS 里判断 `i == n - 1`，要么先放入 `level` 再取 `level.back()`。
另一种思路：DFS **先右后左**，每个深度第一次访问到的节点就是该层最右节点。

**提示 3（伪代码）**
```
BFS 分层，每层循环 i in 0..n-1，若 i == n-1 则 res.push(当前值)
```

**完整代码（BFS）**

```cpp
// LC 199 二叉树的右视图
#include <vector>
#include <queue>
using namespace std;

vector<int> rightSideView(TreeNode* root) {
    vector<int> res;
    if (!root) return res;

    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        int n = q.size();
        for (int i = 0; i < n; i++) {
            TreeNode* cur = q.front(); q.pop();
            if (i == n - 1) res.push_back(cur->val);   // 本层最后一个
            if (cur->left)  q.push(cur->left);
            if (cur->right) q.push(cur->right);
        }
    }
    return res;
}
```

**完整代码（DFS 先右后左）**

```cpp
// LC 199 DFS：每个深度首次访问即最右
void dfs(TreeNode* root, int depth, vector<int>& res) {
    if (!root) return;
    if (depth == (int)res.size()) res.push_back(root->val);   // 首次到达该深度
    dfs(root->right, depth + 1, res);
    dfs(root->left,  depth + 1, res);
}
vector<int> rightSideView(TreeNode* root) {
    vector<int> res;
    dfs(root, 0, res);
    return res;
}
```

**复杂度**：时间 O(n)，空间 O(w) 或 O(h)。

**易错点**
- BFS 里忘记先固定 `n` → 串层，结果错。
- DFS 版忘记"先右后左" → 得到左视图。
- 空树没判。

**面试追问**
- 左视图怎么改？→ DFS 先左后右，或 BFS 取 `i == 0`。
- 如果要**每层最右的路径**（返回节点列表）？→ 记录 parent 或直接返回节点。
:::

:::qa LC 114 · 二叉树展开为链表（Medium｜必刷）

**题目**
给你二叉树的根结点 `root`，请你将它展开为一个**单链表**：
- 展开后的单链表应该同样使用 `TreeNode`，其中 `right` 子指针指向链表中下一个结点，而**左子指针始终为 `null`**；
- 展开后的单链表应该与二叉树的**先序遍历**顺序相同。

**示例 1**
```
输入：root = [1,2,5,3,4,null,6]
输出：[1,null,2,null,3,null,4,null,5,null,6]
```

**示例 2**
```
输入：root = []
输出：[]
```

**示例 3**
```
输入：root = [0]
输出：[0]
```

**约束**：节点数范围 `[0, 2000]`；`-100 <= Node.val <= 100`
**进阶**：原地展开，`O(1)` 额外空间。

**提示 1（方向）**
先序顺序是"根 → 左 → 右"。原地做法：对每个节点，把**左子树整体搬到右边**，再把**原右子树接到左子树的最右端**。

**提示 2（关键不变量）**
"左子树的最右节点"就是先序里左子树最后一个被访问的节点，它的 `right` 天然为空 → 正好用来挂原右子树。
处理完当前节点后 `cur = cur->right`（此时右边已经是原来的左子树），继续。

**提示 3（伪代码）**
```
cur = root
while cur:
    if cur->left:
        p = cur->left;  while p->right: p = p->right   // 左子树最右
        p->right = cur->right                          // 接上原右子树
        cur->right = cur->left                         // 左移到右
        cur->left = nullptr
    cur = cur->right
```

**完整代码**

```cpp
// LC 114 二叉树展开为链表（原地 O(1) 空间）
void flatten(TreeNode* root) {
    TreeNode* cur = root;
    while (cur) {
        if (cur->left) {
            TreeNode* p = cur->left;
            while (p->right) p = p->right;   // 左子树中最右的节点
            p->right = cur->right;           // 原右子树挂到最右端
            cur->right = cur->left;          // 左子树搬到右边
            cur->left = nullptr;             // 左指针置空
        }
        cur = cur->right;                    // 继续（此时右边是原左子树）
    }
}
```

**复杂度**：时间 O(n)（每个节点被"找最右"访问的次数摊还后仍是 O(n)），空间 O(1)。

**易错点**
- 忘记 `cur->left = nullptr` → 不满足题目要求。
- 找最右节点时写成 `p->left` → 错。
- 担心"两层循环"是 O(n²)：每个节点的右指针只会被重接一次，摊还 O(n)。

**面试追问**
- 递归写法（返回展开后的尾节点）？→ `flatten(left); flatten(right); 接起来`。
- 用"先序遍历 + 重新连接"的 O(n) 空间写法？→ 先收集节点指针，再依次串起来，简单但不满足进阶要求。
- 为什么题目要求先序顺序？→ 便于后续用"递归展开 + 尾节点"的方式实现。
:::

:::qa LC 105 · 从前序与中序遍历序列构造二叉树（Medium｜必刷）

**题目**
给定两个整数数组 `preorder` 和 `inorder`，其中 `preorder` 是二叉树的**先序遍历**，`inorder` 是同一棵树的**中序遍历**，请构造二叉树并返回其根节点。

**示例 1**
```
输入：preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]
输出：[3,9,20,null,null,15,7]
```

**示例 2**
```
输入：preorder = [-1], inorder = [-1]
输出：[-1]
```

**约束**：`1 <= preorder.length <= 3000`；`inorder.length == preorder.length`；`-3000 <= preorder[i], inorder[i] <= 3000`；两个数组均**无重复元素**；保证 `preorder` 是 `inorder` 的前序遍历

**提示 1（方向）**
先序的第一个元素是**根**；在中序里找到这个根，就能把中序切成"左子树区间"和"右子树区间"，长度确定后先序也能切。→ 递归分治。

**提示 2（关键不变量）**
用哈希表记录"值 → 中序下标"，把每次查找从 O(n) 降到 O(1)。
设根在中序的下标为 `k`，左子树节点数 `leftSize = k - il`，则：
`左子树先序区间 = [pl+1, pl+leftSize]`，`右子树先序区间 = [pl+leftSize+1, pr]`。

**提示 3（伪代码）**
```
build(pl, pr, il, ir):
    if pl > pr: return null
    root = new(pre[pl]); k = pos[pre[pl]]; leftSize = k - il
    root->left  = build(pl+1, pl+leftSize, il, k-1)
    root->right = build(pl+leftSize+1, pr, k+1, ir)
    return root
```

**完整代码**

```cpp
// LC 105 从前序与中序构造二叉树
#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
    unordered_map<int, int> pos;      // 值 -> 中序下标

    TreeNode* build(vector<int>& pre, int pl, int pr, int il, int ir) {
        if (pl > pr) return nullptr;
        TreeNode* root = new TreeNode(pre[pl]);
        int k = pos[pre[pl]];                  // 根在中序的位置
        int leftSize = k - il;                 // 左子树节点数
        root->left  = build(pre, pl + 1, pl + leftSize, il, k - 1);
        root->right = build(pre, pl + leftSize + 1, pr, k + 1, ir);
        return root;
    }

public:
    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
        pos.clear();
        for (int i = 0; i < (int)inorder.size(); i++) pos[inorder[i]] = i;
        return build(preorder, 0, (int)preorder.size() - 1, 0, (int)inorder.size() - 1);
    }
};
```

**复杂度**：时间 O(n)，空间 O(n)（哈希 + 递归栈）。

**易错点**
- `leftSize` 算错（用 `k` 而不是 `k - il`）。
- 左右子树的先序区间切错（右子树起点是 `pl + leftSize + 1`）。
- 中序有重复值时哈希会覆盖（题目保证无重复，但要能说明）。

**面试追问**
- 中序 + 后序（LC 106）？→ 后序最后一个元素是根，右子树节点数 = `ir - k`。
- **只用前序 + 后序行不行**？→ 不行，无法唯一确定左右子树的划分（无法区分单孩子情况）。
- 为什么需要哈希？→ 否则每层都要线性查找根，退化 O(n²)。
:::

:::qa LC 437 · 路径总和 III（Medium｜必刷）

**题目**
给定一个二叉树的根节点 `root`，和一个整数 `targetSum`，求该二叉树里**节点值之和等于 `targetSum` 的路径的数目**。
- 路径**不需要从根节点开始**，也不需要在叶子节点结束；
- 但是路径方向必须是**向下**的（只能从父节点到子节点）。

**示例 1**
```
输入：root = [10,5,-2,3,7,11], targetSum = 8
输出：3
解释：和为 8 的路径有 3 条
```

**示例 2**
```
输入：root = [5,4,8,11,null,13,4,7,2,null,null,5,1], targetSum = 22
输出：3
```

**约束**：节点数范围 `[0, 1000]`；`-10^9 <= Node.val <= 10^9`；`-1000 <= targetSum <= 1000`

**提示 1（方向）**
把"从根到当前的路径和"当成**前缀和**（和 LC 560 一样）：当前路径和 `cur`，若历史上存在 `cur - target`，就说明中间有一段和为 `target`。
树上要"进入节点时记录、离开节点时撤销" → **回溯**。

**提示 2（关键不变量）**
哈希表 `cnt` 存"当前递归栈中所有前缀和的出现次数"，初始化 `cnt[0] = 1`（表示"从根开始"这一种情况）。
离开节点时必须 `cnt[cur]--`（并可选 erase）——这是树上回溯的核心。

**提示 3（伪代码）**
```
cnt = {0: 1}
dfs(root, cur):
    if !root: return 0
    cur += root->val
    res = cnt[cur - target]        // 历史前缀和匹配数
    cnt[cur]++
    res += dfs(left, cur) + dfs(right, cur)
    cnt[cur]--                     // 回溯撤销
    return res
```

**完整代码**

```cpp
// LC 437 路径总和 III
// 树上前缀和 + 回溯：与 LC 560 同构
#include <unordered_map>
using namespace std;

class Solution {
    unordered_map<long long, int> cnt;      // 前缀和 -> 出现次数

    int dfs(TreeNode* root, long long target, long long cur) {
        if (!root) return 0;
        cur += root->val;
        int res = cnt.count(cur - target) ? cnt[cur - target] : 0;
        cnt[cur]++;
        res += dfs(root->left, target, cur) + dfs(root->right, target, cur);
        if (--cnt[cur] == 0) cnt.erase(cur);   // 回溯：撤销本节点的影响
        return res;
    }

public:
    int pathSum(TreeNode* root, int targetSum) {
        cnt.clear();
        cnt[0] = 1;                            // 空前缀
        return dfs(root, targetSum, 0);
    }
};
```

**复杂度**：时间 O(n)，空间 O(h)。

**易错点**
- 忘记回溯撤销 → 兄弟子树的路径被算到一起，答案偏大。
- `cur` 用 `int` → 值可达 `10^9` × 1000 个节点，必须 `long long`。
- 忘记 `cnt[0] = 1` → 少算"从根开始"的路径。

**面试追问**
- 朴素 O(n²) 写法？→ 对每个节点做一次"以它为起点的向下路径计数"（双重递归）。
- 为什么前缀和能降到 O(n)？→ 把"枚举起点"变成"查历史差值"。
- 如果路径允许**向上**？→ 题目不允许；允许的话图论化（求树上路径和）。
:::

:::qa LC 236 · 二叉树的最近公共祖先（Medium｜必刷）

**题目**
给定一个二叉树，找到该树中两个指定节点 `p`、`q` 的**最近公共祖先**。
最近公共祖先：对于有根树 `T` 的两个节点 `p`、`q`，最近公共祖先表示为一个节点 `x`，满足 `x` 是 `p`、`q` 的祖先且 `x` 的**深度尽可能大**（一个节点也可以是它自己的祖先）。

**示例 1**
```
输入：root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1
输出：3
解释：节点 5 和节点 1 的最近公共祖先是节点 3
```

**示例 2**
```
输入：root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4
输出：5
解释：节点 5 和节点 4 的最近公共祖先是节点 5（一个节点可以是自己的祖先）
```

**示例 3**
```
输入：root = [1,2], p = 1, q = 2
输出：1
```

**约束**：节点数范围 `[2, 10^5]`；`-10^9 <= Node.val <= 10^9`；所有 `Node.val` **互不相同**；`p != q`；`p` 和 `q` 均存在于给定的二叉树中

**提示 1（方向）**
自底向上：如果左右子树各找到一个目标节点，当前节点就是 LCA；如果只有一边找到，就把那一边的结果往上返回。

**提示 2（关键不变量）**
函数返回值的语义要说清：**"在以 root 为根的子树中，如果只找到 p 或 q 中的一个，就返回那个节点；如果两个都找到，返回它们的 LCA；都没找到返回 null"**。
终止条件 `root == p || root == q` 直接返回 `root`（自己也是自己的祖先）。

**提示 3（伪代码）**
```
if !root or root==p or root==q: return root
L = lca(root->left); R = lca(root->right)
if L and R: return root     // 两侧各一个 → 当前是 LCA
return L ? L : R
```

**完整代码**

```cpp
// LC 236 二叉树的最近公共祖先
TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
    if (!root || root == p || root == q) return root;
    TreeNode* L = lowestCommonAncestor(root->left, p, q);
    TreeNode* R = lowestCommonAncestor(root->right, p, q);
    if (L && R) return root;      // 两边各找到一个 → 当前节点即 LCA
    return L ? L : R;             // 都在同一边（或都没找到）
}
```

**复杂度**：时间 O(n)，空间 O(h)。

**易错点**
- 返回值语义说不清（面试官一定会追问"这个返回值代表什么"）。
- 只往一边递归（以为 p、q 都在"更小/更大"的那边，那是 BST 版本）。
- 用 `val` 比较而不是指针比较（值唯一时等价，但指针更严谨）。

**面试追问**
- **BST 版本（LC 235）**怎么写？→ 若 `p->val < root->val && q->val < root->val` 往左，反之往右，否则当前即 LCA，O(h)。
- 如果树中有指向父节点的指针？→ 转成"两条链表找交点"（LC 160）。
- 如果 p、q 可能不存在于树中？→ 需要额外标记"是否真的找到"，返回值要带状态。
:::

:::qa LC 124 · 二叉树中的最大路径和（Hard｜必刷）

**题目**
二叉树中的**路径**被定义为一条节点序列，序列中每对相邻节点之间都存在一条边。同一个节点在一条路径序列中**至多出现一次**。该路径**至少包含一个节点**，且不一定经过根节点。
**路径和**是路径中各节点值的总和。给你一个二叉树的根节点 `root`，返回其**最大路径和**。

**示例 1**
```
输入：root = [1,2,3]
输出：6
解释：最优路径是 2 → 1 → 3，和为 6
```

**示例 2**
```
输入：root = [-10,9,20,null,null,15,7]
输出：42
解释：最优路径是 15 → 20 → 7，和为 42
```

**约束**：节点数范围 `[1, 3 * 10^4]`；`-1000 <= Node.val <= 1000`

**提示 1（方向）**
与 LC 543 直径完全同构：**在某个节点处"左右都要"结算答案，但返回给父节点只能"选一边"**。

**提示 2（关键不变量）**
返回的是"从当前节点往下走的**最大单边贡献**"：`root->val + max(0, 左贡献) + max(0, 右贡献)` 用于**结算**，`root->val + max(左贡献, 右贡献)` 用于**返回**。
负贡献直接丢弃（`max(0, ...)`），因为"不加比加更好"。

**提示 3（伪代码）**
```
best = -INF
gain(root):
    if !root: return 0
    L = max(0, gain(left)); R = max(0, gain(right))
    best = max(best, root->val + L + R)     // 以 root 为最高点
    return root->val + max(L, R)            // 单边返回
```

**完整代码**

```cpp
// LC 124 二叉树中的最大路径和
#include <algorithm>
#include <climits>
using namespace std;

class Solution {
    int best = INT_MIN;

    int gain(TreeNode* root) {
        if (!root) return 0;
        int L = max(0, gain(root->left));       // 负贡献不要
        int R = max(0, gain(root->right));
        best = max(best, root->val + L + R);    // 以当前节点为最高点结算
        return root->val + max(L, R);           // 只能选一条边上行
    }

public:
    int maxPathSum(TreeNode* root) {
        best = INT_MIN;                          // 全负数时也要能取到正确值
        gain(root);
        return best;
    }
};
```

**复杂度**：时间 O(n)，空间 O(h)。

**易错点**
- `best` 初始化为 0 → 全负数树（如 `[-3]`）返回 0（错，应为 -3）。
- 忘记 `max(0, ...)` → 负贡献拖累。
- 返回值写成 `root->val + L + R` → 路径在父节点处分叉，答案被重复计算。

**面试追问**
- 与 543 直径的对应关系？→ 直径求边数（`L + R`），本题求和（`val + L + R`）。
- 如果要返回**路径本身**？→ 记录每个节点的最佳方向，最后回溯还原。
- 为什么"至少包含一个节点"这个条件重要？→ 决定了 `best` 不能用 0 初始化。
:::

:::qa LC 297 · 二叉树的序列化与反序列化（Hard｜必刷）

**题目**
请设计一个算法来实现二叉树的**序列化**与**反序列化**。这里不限定你的序列化/反序列化算法执行逻辑，你只需要保证一个二叉树可以被序列化为一个字符串，并且将这个字符串反序列化为原始的树结构。

**示例 1**
```
输入：root = [1,2,3,null,null,4,5]
输出：[1,2,3,null,null,4,5]
解释：序列化后再反序列化，应得到与原树完全相同的树
```

**示例 2**
```
输入：root = []
输出：[]
```

**约束**：树中结点数范围 `[0, 10^4]`；`-1000 <= Node.val <= 1000`

**提示 1（方向）**
关键难点是**唯一还原**。只写"遍历序列"是不够的：不同的树可能产生相同的前序序列（如单链左右孩子不同）→ **必须把 `null` 也标记出来**。

**提示 2（关键不变量）**
带 `null` 标记的前序遍历可以唯一确定一棵树：每个节点都知道自己后面紧跟的是"左子树的完整序列"，遇到 `null` 就返回，从而自然确定边界。

**提示 3（伪代码）**
```
serialize: 前序，空节点输出 "null"，用 ',' 分隔
deserialize: 按下标 i 顺序消费：
    if v[i]=="null": i++; return null
    root = new(v[i++]); root->left = f(); root->right = f(); return root
```

**完整代码**

```cpp
// LC 297 二叉树的序列化与反序列化（带 null 标记的前序）
#include <string>
#include <vector>
#include <sstream>
using namespace std;

class Codec {
    void ser(TreeNode* root, string& out) {
        if (!root) { out += "null,"; return; }
        out += to_string(root->val) + ",";
        ser(root->left, out);
        ser(root->right, out);
    }

    TreeNode* deser(const vector<string>& v, int& i) {
        if (i >= (int)v.size() || v[i] == "null") { i++; return nullptr; }
        TreeNode* root = new TreeNode(stoi(v[i++]));
        root->left  = deser(v, i);
        root->right = deser(v, i);
        return root;
    }

public:
    string serialize(TreeNode* root) {
        string out;
        ser(root, out);
        return out;
    }

    TreeNode* deserialize(string data) {
        vector<string> v;
        string cur;
        stringstream ss(data);
        while (getline(ss, cur, ',')) if (!cur.empty()) v.push_back(cur);   // 末尾空串要跳过
        int i = 0;
        return deser(v, i);
    }
};
```

**复杂度**：时间 O(n)，空间 O(n)。

**易错点**
- 不标记 `null` → 无法唯一还原（这是本题的核心考点）。
- 字符串末尾的逗号产生空 token → 反序列化时 `stoi("")` 崩溃。
- `deser` 没做 `i < v.size()` 边界检查。
- 用 `atoi` 处理负数/大数没问题，但注意 `to_string`/`stoi` 的配对。

**面试追问**
- 为什么不标记 `null` 不能唯一还原？→ 举例：`[1,2]` 无法区分 2 是左孩子还是右孩子。
- BFS 序列化怎么做？→ 层序 + `null` 占位，反序列化时用队列配对父子。
- 如果要求**压缩体积**？→ 用二进制/分隔符优化，或对重复结构做字典编码（工程题常见）。
:::

---

## 今日复盘五问

1. 230 为什么可以不遍历整棵树？（中序 + 提前退出）
2. 114 表面两层循环，为什么仍是 O(n)？（每个节点的右指针只被重接一次）
3. 437 和 560 的共同思路是什么？树上版本多了哪一步？（回溯撤销）
4. 236 的返回值语义你能一句话说清吗？
5. 124 的 `best` 为什么不能初始化为 0？
