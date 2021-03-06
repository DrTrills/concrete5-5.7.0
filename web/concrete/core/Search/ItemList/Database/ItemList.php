<?
namespace Concrete\Core\Search\ItemList\Database;
use Concrete\Core\Search\StickyRequest;
use Database;
use Concrete\Core\Search\ItemList\ItemList as AbstractItemList;

abstract class ItemList extends AbstractItemList
{

    /** @var \Doctrine\DBAL\Query\QueryBuilder */
    protected $query;

    /** @var  \Concrete\Core\Search\StickyRequest | null */
    protected $searchRequest;

    abstract public function createQuery();

    /**
     * @param \Doctrine\DBAL\Query\QueryBuilder $query
     * @return \Doctrine\DBAL\Query\QueryBuilder
     */
    public function finalizeQuery(\Doctrine\DBAL\Query\QueryBuilder $query)
    {
        return $query;
    }

    public function __construct(StickyRequest $req = null)
    {
        $this->query = Database::get()->createQueryBuilder();
        $this->searchRequest = $req;
        $this->createQuery();
    }

    public function getQueryObject()
    {
        return $this->query;
    }

    public function deliverQueryObject()
    {
        // setup the default sorting based on the request.
        $this->setupAutomaticSorting($this->searchRequest);
        $query = clone $this->query;
        $query = $this->finalizeQuery($query);
        return $query;
    }

    public function executeGetResults()
    {
        return $this->deliverQueryObject()->execute()->fetchAll();
    }

    protected function executeSortBy($column, $direction = 'asc')
    {
        $this->query->orderBy($column, $direction);
    }

    public function filter($field, $value, $comparison = '=')
    {
        $this->query->andWhere(implode(' ', array(
           $field, $comparison, $this->query->createNamedParameter($value)
        )));
    }

}