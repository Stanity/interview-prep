# Day 10 · 图 / 网格 / 拓扑 / Trie（8 题）

> 今日考点：**网格 flood fill**（连通块计数）、**多源 BFS**（最短时间）、**拓扑排序**（判环 + 排序）、**并查集**（连通性）、**Trie**（前缀检索）。

:::card 图论四件套（按这个顺序选工具）
| 需求 | 工具 | 复杂度 | 典型题 |
|---|---|---|---|
| 数连通块 / 区域染色 | **DFS 或 BFS flood fill** | O(mn) | 200 岛屿、130 被围绕 |
| 求"最短扩散时间/步数" | **多源 BFS**（初始把所有源入队） | O(mn) | 994 腐烂橘子 |
| 有向图判环 / 依赖顺序 | **拓扑排序**（Kahn：入度为 0 入队） | O(V+E) | 207 / 210 课程表 |
| 动态连通性 / 合并集合 | **并查集**（路径压缩 + 按秩合并） | 近 O(1) | 547 省份 |
| 前缀匹配 / 多模式串 | **Trie** | O(L) | 208 / 212 |

```cpp
// 拓扑排序模板（Kahn）
vector<int> indeg(n, 0);
for (auto& e : edges) indeg[e.to]++;
queue<int> q;
for (int i = 0; i < n; i++) if (indeg[i] == 0) q.push(i);
while (!q.empty()) {
    int u = q.front(); q.pop(); order.push_back(u);
    for (int v : g[u]) if (--indeg[v] == 0) q.push(v);
}
// order.size() == n 说明无环
```
**关键判断**：`order.size() == n` → 无环；否则存在环（剩下的节点入度都 ≥ 1）。
:::

| 题号 | 题目 | 难度 | 核心 |
|---|---|---|---|
| 200 | 岛屿数量 | Medium | DFS 淹没 |
| 994 | 腐烂的橘子 | Medium | 多源 BFS 按层计时 |
| 207 | 课程表 | Medium | 拓扑排序判环 |
| 210 | 课程表 II | Medium | 拓扑排序输出顺序 |
| 208 | 实现 Trie | Medium | 26 叉树 + isEnd |
| 547 | 省份数量 | Medium | DFS / 并查集 |
| 133 | 克隆图 | Medium | 哈希 + DFS（先登记后递归） |
| 130 | 被围绕的区域 | Medium | 从边界反向染色 |

---

:::qa LC 200 · 岛屿数量（Medium｜必刷）

**题目**
给你一个由 `'1'`（陆地）和 `'0'`（水）组成的二维网格，请你计算网格中**岛屿的数量**。
- 岛屿总是被水包围，并且每座岛屿只能由水平方向和/或竖直方向上相邻的陆地连接形成；
- 你可以假设该网格的四条边均被水包围。

**示例 1**
```
输入：grid = [["1","1","1","1","0"],
              ["1","1","0","1","0"],
              ["1","1","0","0","0"],
              ["0","0","0","0","0"]]
输出：1
```

**示例 2**
```
输入：grid = [["1","1","0","0","0"],
              ["1","1","0","0","0"],
              ["0","0","1","0","0"],
              ["0","0","0","1","1"]]
输出：3
```

**约束**：`1 <= m, n <= 300`；`grid[i][j]` 的值为 `'0'` 或 `'1'`

**提示 1（方向）**
每遇到一个没访问过的 `'1'`，就说明发现了一座新岛 → 计数 +1，然后把它**整个连通块"淹没"**（改成 `'0'`），这样不会重复计数。

**提示 2（关键不变量）**
"淹没"用原地修改代替 `visited` 数组，省 O(mn) 空间。遍历顺序不影响结果：每块陆地只被访问一次。

**提示 3（伪代码）**
```
for each cell:
    if grid[i][j] == '1': cnt++; dfs(i, j)     // dfs 把整块改成 '0'
dfs(i,j): 越界或非 '1' 则返回；否则置 '0'，向四邻域递归
```

**完整代码（DFS）**

```cpp
// LC 200 岛屿数量
#include <vector>
using namespace std;

void dfs(vector<vector<char>>& g, int i, int j) {
    if (i < 0 || i >= (int)g.size() || j < 0 || j >= (int)g[0].size()) return;
    if (g[i][j] != '1') return;
    g[i][j] = '0';                       // 淹没
    dfs(g, i + 1, j);
    dfs(g, i - 1, j);
    dfs(g, i, j + 1);
    dfs(g, i, j - 1);
}

int numIslands(vector<vector<char>>& grid) {
    int cnt = 0;
    for (int i = 0; i < (int)grid.size(); i++)
        for (int j = 0; j < (int)grid[0].size(); j++)
            if (grid[i][j] == '1') { cnt++; dfs(grid, i, j); }
    return cnt;
}
```

**复杂度**：时间 O(mn)，空间 O(mn)（递归栈最坏情况）。

**易错点**
- 忘记标记已访问 → 无限递归（栈溢出）。
- 递归版在 `m = n = 300` 全陆地时可能爆栈 → 面试要能改成 BFS。
- 四邻域写成八邻域（题目只要上下左右）。

**面试追问**
- BFS 写法？→ `queue<pair<int,int>>` + 入队即标记，避免重复入队。
- 并查集写法？→ 对每个 `'1'` 与右/下邻居合并，最后统计不同集合数。
- 如果要求"最大岛屿面积"（LC 695）？→ DFS 返回面积并取 max。
:::

:::qa LC 994 · 腐烂的橘子（Medium｜必刷）

**题目**
在给定的 `m x n` 网格 `grid` 中，每个单元格可以有以下三个值之一：
- `0` 代表空单元格；`1` 代表新鲜橘子；`2` 代表腐烂的橘子。

每分钟，腐烂的橘子**周围 4 个方向上相邻**的新鲜橘子都会腐烂。
返回直到单元格中没有新鲜橘子为止所必须经过的**最小分钟数**。如果不可能，返回 `-1`。

**示例 1**
```
输入：grid = [[2,1,1],
              [1,1,0],
              [0,1,1]]
输出：4
```

**示例 2**
```
输入：grid = [[2,1,1],
              [0,1,1],
              [1,0,1]]
输出：-1
解释：左下角的橘子永远不会腐烂
```

**示例 3**
```
输入：grid = [[0,2]]
输出：0
解释：没有新鲜橘子，0 分钟
```

**约束**：`1 <= m, n <= 10`；`grid[i][j]` 仅为 `0`、`1` 或 `2`

**提示 1（方向）**
"所有腐烂源同时向外扩散，求最短时间" → **多源 BFS**：一开始把**所有**腐烂橘子入队，然后按层扩散，每层代表 1 分钟。

**提示 2（关键不变量）**
- 用 `fresh` 计数剩余新鲜橘子，扩散时递减；
- 每轮记录 `q.size()`，处理完这一轮 → `minutes++`；
- 结束时 `fresh == 0` 返回 `minutes`，否则 `-1`（有橘子永远烂不到）。

**提示 3（伪代码）**
```
把所有 2 入队，统计 fresh
while q 非空 and fresh > 0:
    n = q.size()
    repeat n times: 弹出，四邻域若是 1 → 置 2、fresh--、入队
    minutes++
return fresh == 0 ? minutes : -1
```

**完整代码**

```cpp
// LC 994 腐烂的橘子
#include <vector>
#include <queue>
using namespace std;

int orangesRotting(vector<vector<int>>& g) {
    int m = g.size(), n = g[0].size();
    queue<pair<int, int>> q;
    int fresh = 0;

    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++) {
            if (g[i][j] == 2) q.push({i, j});
            else if (g[i][j] == 1) fresh++;
        }

    if (fresh == 0) return 0;                 // 没有新鲜橘子

    int minutes = 0;
    int dirs[4][2] = {{1,0},{-1,0},{0,1},{0,-1}};

    while (!q.empty() && fresh > 0) {
        int sz = q.size();                    // 本轮要处理的全部源
        for (int k = 0; k < sz; k++) {
            pair<int,int> cur = q.front(); q.pop();
            int x = cur.first, y = cur.second;
            for (auto& d : dirs) {
                int nx = x + d[0], ny = y + d[1];
                if (nx < 0 || nx >= m || ny < 0 || ny >= n || g[nx][ny] != 1) continue;
                g[nx][ny] = 2;                // 入队即标记
                fresh--;
                q.push({nx, ny});
            }
        }
        minutes++;
    }
    return fresh == 0 ? minutes : -1;
}
```

**复杂度**：时间 O(mn)，空间 O(mn)。

**易错点**
- 只把第一个腐烂橘子入队（单源 BFS）→ 结果偏大。
- 忘记 `fresh == 0` 的提前返回 → `[[0,2]]` 会返回 1 而不是 0。
- 入队时不标记，等弹出才标记 → 同一格可能被多次入队（结果可能仍对但浪费时间）。

**面试追问**
- 为什么用多源 BFS 而不是对每个腐烂橘子各做一次 BFS？→ 多源一次就能得到"最短到达时间"（等价于虚拟超级源）。
- 如果每分钟扩散只沿一个方向？→ 题意变了，需要具体分析。
- 与 200 岛屿的区别？→ 200 数连通块（DFS 即可），994 求最短距离（必须 BFS）。
:::

:::qa LC 207 · 课程表（Medium｜必刷）

**题目**
你这个学期必须选修 `numCourses` 门课程，记为 `0` 到 `numCourses - 1`。
在选修某些课程之前需要一些先修课程。先修课程按数组 `prerequisites` 给出，其中 `prerequisites[i] = [aᵢ, bᵢ]`，表示如果要学习课程 `aᵢ` 则**必须**先学习课程 `bᵢ`。
请你判断是否可能完成所有课程的学习？如果可以，返回 `true`；否则返回 `false`。

**示例 1**
```
输入：numCourses = 2, prerequisites = [[1,0]]
输出：true
解释：总共有 2 门课程。学习课程 1 之前需要完成课程 0
```

**示例 2**
```
输入：numCourses = 2, prerequisites = [[1,0],[0,1]]
输出：false
解释：存在环（0 依赖 1，1 又依赖 0），不可能完成
```

**约束**：`1 <= numCourses <= 2000`；`0 <= prerequisites.length <= 5000`；`prerequisites[i] = [aᵢ, bᵢ]` 且 `0 <= aᵢ, bᵢ < numCourses`；课程对互不相同

**提示 1（方向）**
"能否完成所有课程" ≡ **有向图是否存在环** → 拓扑排序。用 Kahn 算法：不断取出**入度为 0** 的节点。

**提示 2（关键不变量）**
统计"被取出过的节点数" `seen`：若 `seen == numCourses` 说明无环（所有节点都能被"解锁"）；否则剩下的节点相互依赖成环。

**提示 3（伪代码）**
```
建图 + 入度
所有入度 0 的入队
while q: 弹出 u，seen++，对 u 的每个后继 v：--indeg[v]，若为 0 则入队
return seen == numCourses
```

**完整代码**

```cpp
// LC 207 课程表（Kahn 拓扑排序判环）
#include <vector>
#include <queue>
using namespace std;

bool canFinish(int numCourses, vector<vector<int>>& pre) {
    vector<vector<int>> g(numCourses);
    vector<int> indeg(numCourses, 0);

    for (auto& p : pre) {           // p[1] 是 p[0] 的先修课
        g[p[1]].push_back(p[0]);    // 边：先修 → 后续
        indeg[p[0]]++;
    }

    queue<int> q;
    for (int i = 0; i < numCourses; i++)
        if (indeg[i] == 0) q.push(i);

    int seen = 0;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        seen++;
        for (int v : g[u]) if (--indeg[v] == 0) q.push(v);
    }
    return seen == numCourses;      // 全部解锁 → 无环
}
```

**复杂度**：时间 O(V + E)，空间 O(V + E)。

**易错点**
- 边的方向建反（`g[p[0]].push_back(p[1])`）→ 判环结果错。
- 入度数组加错对象（应对 `p[0]` 加）。
- 用 `seen > 0` 之类的错误判据。

**面试追问**
- **DFS 三色标记**怎么写？→ 白（未访问）/ 灰（在栈中）/ 黑（已完成），遇到灰色即发现环。
- 两种方法怎么选？→ Kahn 能顺便给出顺序（210），DFS 更容易求"环上节点"。
- 如果依赖关系会动态变化？→ 需要增量拓扑排序（工程上用重启 BFS 或维护队列）。
:::

:::qa LC 210 · 课程表 II（Medium｜必刷）

**题目**
现在你总共有 `numCourses` 门课需要选，记为 `0` 到 `numCourses - 1`。给你一个数组 `prerequisites`，其中 `prerequisites[i] = [aᵢ, bᵢ]`，表示在选修课程 `aᵢ` 前**必须**先选修 `bᵢ`。
返回你为了学完所有课程所安排的**学习顺序**。可能会有多个正确的顺序，你只要返回**任意一种**就可以了。如果不可能完成所有课程，返回一个**空数组**。

**示例 1**
```
输入：numCourses = 2, prerequisites = [[1,0]]
输出：[0,1]
```

**示例 2**
```
输入：numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]
输出：[0,2,1,3]
解释：[0,1,2,3] 也是正确的
```

**示例 3**
```
输入：numCourses = 1, prerequisites = []
输出：[0]
```

**约束**：同 207

**提示 1（方向）**
就是 207 的"顺便记录顺序"版本：Kahn 算法里**弹出的顺序**就是一个合法的拓扑序。

**提示 2（关键不变量）**
出队顺序即答案；若最终 `order.size() < numCourses`，说明有环 → 返回空数组。

**提示 3（伪代码）**
```
同 207，但每次出队时 order.push_back(u)
return order.size() == n ? order : {}
```

**完整代码**

```cpp
// LC 210 课程表 II
#include <vector>
#include <queue>
using namespace std;

vector<int> findOrder(int numCourses, vector<vector<int>>& pre) {
    vector<vector<int>> g(numCourses);
    vector<int> indeg(numCourses, 0);
    for (auto& p : pre) {
        g[p[1]].push_back(p[0]);
        indeg[p[0]]++;
    }

    queue<int> q;
    for (int i = 0; i < numCourses; i++)
        if (indeg[i] == 0) q.push(i);

    vector<int> order;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back(u);
        for (int v : g[u]) if (--indeg[v] == 0) q.push(v);
    }
    return (int)order.size() == numCourses ? order : vector<int>{};
}
```

**复杂度**：时间 O(V + E)，空间 O(V + E)。

**易错点**
- 忘记判断环 → 返回不完整顺序却当成有效答案。
- 用 `vector<int>{}` 返回空（不要返回 `{-1}`）。
- 入度为 0 的初始节点顺序任意，但要**一次性全部入队**（不能只入一个）。

**面试追问**
- 如果要返回**字典序最小**的拓扑序？→ 把 `queue` 换成 `priority_queue`（小根堆）。
- DFS 后序反转法？→ DFS 完成顺序的逆序就是拓扑序（需先判环）。
- 拓扑序唯一吗？→ 不唯一；唯一当且仅当任意时刻队列里只有一个节点。
:::

:::qa LC 208 · 实现 Trie（前缀树）（Medium｜必刷）

**题目**
**Trie**（前缀树）是一种树形数据结构，用于高效地存储和检索字符串数据集中的键。
请你实现 `Trie` 类：
- `Trie()`：初始化前缀树对象
- `void insert(String word)`：向前缀树中插入字符串 `word`
- `boolean search(String word)`：如果字符串 `word` 在前缀树中，返回 `true`（即检索之前已经插入）；否则返回 `false`
- `boolean startsWith(String prefix)`：如果之前已经插入的字符串 `word` 的**前缀之一**为 `prefix`，返回 `true`；否则返回 `false`

**示例 1**
```
输入：
["Trie","insert","search","search","startsWith","insert","search"]
[[],["apple"],["apple"],["app"],["app"],["app"],["app"]]
输出：[null,null,true,false,true,null,true]

解释：
Trie t = new Trie();
t.insert("apple");
t.search("apple");    // true
t.search("app");      // false  ← "app" 是前缀但不是完整单词
t.startsWith("app");  // true
t.insert("app");
t.search("app");      // true
```

**约束**：`1 <= word.length, prefix.length <= 2000`；仅小写英文字母；`insert` / `search` / `startsWith` 调用总次数不超过 `3 * 10^4`

**提示 1（方向）**
每个节点持有一个 **`26` 个子节点指针**（小写字母）+ 一个 `isEnd` 标记"是否有单词在此结束"。

**提示 2（关键不变量）**
`search` 与 `startsWith` 的唯一差别就是**最后是否检查 `isEnd`** —— 共用同一个 `find` 过程。

**提示 3（伪代码）**
```
insert: 沿字符走，缺失就新建节点；末尾 isEnd = true
find(s): 沿字符走，缺失返回 nullptr，否则返回最后节点
search  = find(word) && find(word)->isEnd
startsWith = find(prefix) != nullptr
```

**完整代码**

```cpp
// LC 208 实现 Trie（前缀树）
#include <string>
using namespace std;

struct TrieNode {
    TrieNode* child[26];
    bool isEnd;
    TrieNode() : isEnd(false) {
        for (int i = 0; i < 26; i++) child[i] = nullptr;
    }
};

class Trie {
    TrieNode* root;

    TrieNode* find(const string& s) {          // 走到 s 的末尾节点
        TrieNode* p = root;
        for (char c : s) {
            int i = c - 'a';
            if (!p->child[i]) return nullptr;
            p = p->child[i];
        }
        return p;
    }

public:
    Trie() { root = new TrieNode(); }

    void insert(string word) {
        TrieNode* p = root;
        for (char c : word) {
            int i = c - 'a';
            if (!p->child[i]) p->child[i] = new TrieNode();
            p = p->child[i];
        }
        p->isEnd = true;                        // 标记单词结束
    }

    bool search(string word) {
        TrieNode* p = find(word);
        return p && p->isEnd;                   // 必须是完整单词
    }

    bool startsWith(string prefix) {
        return find(prefix) != nullptr;         // 只要求前缀存在
    }
};
```

**复杂度**：每个操作 O(L)（L 为串长）；空间 O(总字符数 × 26 指针)。

**易错点**
- `search` 只看 `find != nullptr` → `"app"` 在插入 `"apple"` 后会被误判为存在。
- 忘记在 `TrieNode` 构造里初始化 `child` 数组 → 野指针。
- 用 `unordered_map<char, TrieNode*>` 更省空间（大字符集时）。

**面试追问**
- 怎么省内存？→ 用 `unordered_map` / 压缩前缀（Radix Tree）；或静态数组 + 计数分配。
- 支持删除单词？→ 增加 `cnt`（经过次数），删除时递减，为 0 就回收。
- 用 Trie 做"搜索联想"？→ `startsWith` 后从这个节点 DFS 收集所有 `isEnd` 的路径。
:::

:::qa LC 547 · 省份数量（Medium｜必刷）

**题目**
有 `n` 个城市，其中一些彼此相连，另一些没有相连。如果城市 `a` 与城市 `b` 直接相连，且城市 `b` 与城市 `c` 直接相连，那么城市 `a` 与城市 `c` 间接相连。
**省份**是一组直接或间接相连的城市，组内不含其他没有相连的城市。
给你一个 `n x n` 的矩阵 `isConnected`，其中 `isConnected[i][j] = 1` 表示第 `i` 个城市和第 `j` 个城市直接相连，`0` 表示不直接相连。返回矩阵中**省份的数量**。

**示例 1**
```
输入：isConnected = [[1,1,0],
                     [1,1,0],
                     [0,0,1]]
输出：2
```

**示例 2**
```
输入：isConnected = [[1,0,0],
                     [0,1,0],
                     [0,0,1]]
输出：3
```

**约束**：`1 <= n <= 200`；`isConnected[i][i] == 1`；`isConnected[i][j] == isConnected[j][i]`

**提示 1（方向）**
就是"无向图数连通块"，和 200 岛屿同一类问题，只是数据用邻接矩阵给。

**提示 2（关键不变量）**
从每个未访问节点出发做一次 DFS，遍历次数就是连通块数量。

**提示 3（伪代码）**
```
for i in 0..n-1: if !vis[i]: cnt++; dfs(i)
dfs(i): vis[i]=true; for j: if c[i][j] and !vis[j]: dfs(j)
```

**完整代码（DFS）**

```cpp
// LC 547 省份数量（DFS）
#include <vector>
using namespace std;

void dfs(vector<vector<int>>& c, vector<bool>& vis, int i) {
    vis[i] = true;
    for (int j = 0; j < (int)c.size(); j++)
        if (c[i][j] && !vis[j]) dfs(c, vis, j);
}

int findCircleNum(vector<vector<int>>& isConnected) {
    int n = isConnected.size(), cnt = 0;
    vector<bool> vis(n, false);
    for (int i = 0; i < n; i++)
        if (!vis[i]) { cnt++; dfs(isConnected, vis, i); }
    return cnt;
}
```

**完整代码（并查集）**

```cpp
// LC 547 并查集：合并后统计根的数量
#include <numeric>
class DSU {
public:
    vector<int> p, r;
    DSU(int n) : p(n), r(n, 0) { iota(p.begin(), p.end(), 0); }
    int find(int x) { return p[x] == x ? x : p[x] = find(p[x]); }   // 路径压缩
    void unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return;
        if (r[a] < r[b]) swap(a, b);      // 按秩合并
        p[b] = a;
        if (r[a] == r[b]) r[a]++;
    }
};
int findCircleNum(vector<vector<int>>& c) {
    int n = c.size();
    DSU d(n);
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            if (c[i][j]) d.unite(i, j);
    int cnt = 0;
    for (int i = 0; i < n; i++) if (d.find(i) == i) cnt++;
    return cnt;
}
```

**复杂度**：DFS O(n²)；并查集 O(n² α(n))。

**易错点**
- DFS 版忘记 `vis[i] = true`（放在函数开头）。
- 并查集只用 `p[x] = find(p[x])` 而漏掉按秩合并（不影响正确性，但会退化成链）。
- 统计根时用 `p[i] == i` 而不是 `find(i) == i`（未压缩的父指针会错）。

**面试追问**
- 什么场景必须用并查集而 DFS 不行？→ **动态加边**的连通性查询（DFS 每次都要重跑）。
- 并查集能求"连通块大小"吗？→ 额外维护 `size[]`，合并时累加。
- 如果 `n` 达到 10^5 且边很稀疏？→ 用邻接表 + DFS，O(V+E) 而不是 O(n²)。
:::

:::qa LC 133 · 克隆图（Medium｜必刷）

**题目**
给你无向**连通**图中一个节点的引用，请你返回该图的**深拷贝**（克隆）。
图中的每个节点都包含它的值 `val`（`int`）和其邻居的列表（`list[Node]`）。
```cpp
class Node {
public:
    int val;
    vector<Node*> neighbors;
};
```
测试用例中，每个节点的值都和它的索引相同（第一个节点值为 1），图用邻接列表表示。给定节点始终是图中的第一个节点（值为 1）。你必须将**给定节点的拷贝**作为对克隆图的引用返回。

**示例 1**
```
输入：adjList = [[2,4],[1,3],[2,4],[1,3]]
输出：[[2,4],[1,3],[2,4],[1,3]]
解释：图中有 4 个节点。节点 1 的邻居是 2 和 4；节点 2 的邻居是 1 和 3……
```

**示例 2**
```
输入：adjList = [[]]
输出：[[]]
解释：只有一个节点，没有邻居
```

**示例 3**
```
输入：adjList = []
输出：[]
解释：空图
```

**约束**：节点数不超过 100；`Node.val` 唯一，`1 <= val <= 100`；无自环、无重复边；图是连通图

**提示 1（方向）**
图的深拷贝要解决"环"：不能纯粹递归（会无限循环）。用**哈希表 `原节点 → 新节点`**，遇到已克隆的直接返回。

**提示 2（关键不变量）**
**先登记、后递归**：`mp[node] = copy` 必须在递归邻居之前完成，否则遇到环时会重复创建节点（甚至栈溢出）。

**提示 3（伪代码）**
```
clone(node):
    if !node: return null
    if mp 有 node: return mp[node]
    copy = new Node(node->val); mp[node] = copy      // 先登记
    for nb in node->neighbors: copy->neighbors.push(clone(nb))
    return copy
```

**完整代码**

```cpp
// LC 133 克隆图
#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
    unordered_map<Node*, Node*> mp;        // 原节点 -> 克隆节点

    Node* clone(Node* node) {
        if (!node) return nullptr;
        if (mp.count(node)) return mp[node];      // 已克隆过（处理环）

        Node* copy = new Node(node->val);
        mp[node] = copy;                          // 先登记，再递归
        for (Node* nb : node->neighbors)
            copy->neighbors.push_back(clone(nb));
        return copy;
    }

public:
    Node* cloneGraph(Node* node) {
        mp.clear();
        return clone(node);
    }
};
```

**复杂度**：时间 O(V + E)，空间 O(V)。

**易错点**
- 把 `mp[node] = copy` 放在递归之后 → 有环时无限递归。
- 忘记 `if (!node) return nullptr`（示例 3 空图）。
- 用 BFS 时忘记在**入队时**登记 → 同一节点被创建多次。

**面试追问**
- BFS 版本怎么写？→ 队列存原节点，入队时同步创建副本并登记，出队时遍历邻居建立边。
- 与 LC 138（随机链表复制）的共同点？→ 都是"带环/带随机指针的深拷贝"，都用哈希映射解决"节点可能还没创建"的问题。
- 如果要**浅拷贝**呢？→ 只复制节点、共享邻居指针（工程上极少这么用）。
:::

:::qa LC 130 · 被围绕的区域（Medium｜必刷）

**题目**
给你一个 `m x n` 的矩阵 `board`，由若干字符 `'X'` 和 `'O'` 组成，**捕获所有被围绕的区域**：
- **连接**所有**边界上**的 `'O'` 及其相连的 `'O'`（通过上下左右四个方向连接）；
- 任何**不在边界上**、或**不与边界上的 `'O'` 相连**的 `'O'` 都会被填充为 `'X'`。

**示例 1**
```
输入：board = [["X","X","X","X"],
               ["X","O","O","X"],
               ["X","X","O","X"],
               ["X","O","X","X"]]
输出：[["X","X","X","X"],
       ["X","X","X","X"],
       ["X","X","X","X"],
       ["X","O","X","X"]]
解释：被围绕的区间不会存在于边界上，任何边界上的 'O' 都不会被填充为 'X'；
     第四行的 'O' 在边界上，所以不会被填充
```

**示例 2**
```
输入：board = [["X"]]
输出：[["X"]]
```

**约束**：`1 <= m, n <= 200`；`board[i][j]` 为 `'X'` 或 `'O'`

**提示 1（方向）**
正向思考"哪些 O 被包围"很难（要判断每个区域是否触边）。**反向**做：从**边界上的 O** 出发 flood fill，把所有"逃出去的 O"标记出来，剩下没被标记的 O 就是被包围的。

**提示 2（关键不变量）**
用三态标记：`'O'`（未处理）→ `'#'`（确认连到边界）→ 最后统一还原成 `'O'`；仍为 `'O'` 的改成 `'X'`。

**提示 3（伪代码）**
```
对四条边上的每个格子：dfs 标记连通 O 为 '#'
扫描全图：'O' → 'X'（被包围），'#' → 'O'（还原）
```

**完整代码**

```cpp
// LC 130 被围绕的区域
#include <vector>
using namespace std;

void dfs(vector<vector<char>>& b, int i, int j) {
    if (i < 0 || i >= (int)b.size() || j < 0 || j >= (int)b[0].size()) return;
    if (b[i][j] != 'O') return;
    b[i][j] = '#';                     // 标记：与边界连通
    dfs(b, i + 1, j);
    dfs(b, i - 1, j);
    dfs(b, i, j + 1);
    dfs(b, i, j - 1);
}

void solve(vector<vector<char>>& board) {
    int m = board.size(), n = board[0].size();

    for (int i = 0; i < m; i++) { dfs(board, i, 0); dfs(board, i, n - 1); }   // 左右边
    for (int j = 0; j < n; j++) { dfs(board, 0, j); dfs(board, m - 1, j); }   // 上下边

    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++) {
            if (board[i][j] == 'O')      board[i][j] = 'X';   // 被包围
            else if (board[i][j] == '#') board[i][j] = 'O';   // 还原
        }
}
```

**复杂度**：时间 O(mn)，空间 O(mn)（递归栈）。

**易错点**
- 想正向判断每个 O 是否被包围 → 逻辑复杂且容易错。
- 只从四个角出发（应该遍历**整条边**）。
- 忘记把 `'#'` 还原成 `'O'`。

**面试追问**
- 为什么反向染色更好？→ 把"全局判断"降级为"连通性标记"，一次 DFS 即可。
- BFS 版怎么写？→ 队列存边界 O 的坐标，入队即标记 `'#'`。
- 与 200 岛屿的关系？→ 同一套 flood fill，只是出发点被限定为边界。
:::

---

## 今日复盘四问

1. 什么时候必须用 BFS 而不能用 DFS？（求**最短距离/最少时间**，如 994）
2. 拓扑排序判环的依据是什么？（`order.size() == n`）
3. 并查集相比 DFS 的唯一优势是什么？（**动态加边**的连通性）
4. 133 和 138 为什么都要"先登记后递归"？（图/随机链表都有环，避免重复创建）
